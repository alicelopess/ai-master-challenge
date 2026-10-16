import pytest

from leadscorer import data, policy, triage, views
from leadscorer.__main__ import main
from leadscorer.errors import DataError, NotFoundError, PolicyError

from conftest import PIPELINE, PRODUCTS, SALES_TEAMS, opp, write_raw


def run_cli(raw_dir, capsys, *args):
    code = main(["--raw", str(raw_dir), *args])
    captured = capsys.readouterr()
    return code, captured.out, captured.err


def test_missing_file_names_file_folder_and_download_step(raw_dir, capsys):  # AC-1.2
    (raw_dir / "products.csv").unlink()
    with pytest.raises(DataError) as error:
        data.load(raw_dir)
    message = str(error.value)
    assert "products.csv" in message and str(raw_dir) in message
    assert policy.DATASET_URL in message and "data/raw/README.md" in message
    code, out, err = run_cli(raw_dir, capsys, "list", "--seller", "Ana Alfa")
    assert code == 1 and out == "" and message in err


def test_empty_file(raw_dir):  # AC-1.3
    (raw_dir / "sales_pipeline.csv").write_text("")
    with pytest.raises(DataError, match="sales_pipeline.csv está vazio"):
        data.load(raw_dir)


def test_binary_file_is_not_csv(raw_dir):  # AC-1.3
    (raw_dir / "sales_pipeline.csv").write_bytes(b"\x89PNG\r\n\x1a\n\x00\xff\xfe\xfa")
    with pytest.raises(DataError, match="sales_pipeline.csv não é um CSV válido"):
        data.load(raw_dir)


def test_missing_column_is_listed(tmp_path):  # AC-1.3
    rows = [{k: v for k, v in row.items() if k != "engage_date"} for row in PIPELINE]
    with pytest.raises(DataError, match="sales_pipeline.csv sem as colunas: engage_date"):
        data.load(write_raw(tmp_path / "raw", sales_pipeline=rows))


def test_unknown_product_label_fails_without_dropping(tmp_path):  # AC-1.4
    rows = PIPELINE + [opp("U1", "Ana Alfa", "GTX Ultra", "Engaging", engaged=5)]
    with pytest.raises(DataError) as error:
        data.load(write_raw(tmp_path / "raw", sales_pipeline=rows))
    assert "GTX Ultra" in str(error.value) and "U1" in str(error.value)
    assert "Nenhuma linha foi descartada" in str(error.value)


def test_unknown_stage_fails(tmp_path):
    rows = PIPELINE + [opp("S1", "Ana Alfa", "GTX Basic", "Negotiating", engaged=5)]
    with pytest.raises(DataError, match="Estágio desconhecido.*Negotiating.*S1"):
        data.load(write_raw(tmp_path / "raw", sales_pipeline=rows))


def test_date_out_of_format_fails(tmp_path):
    rows = [dict(row) for row in PIPELINE]
    rows[3]["engage_date"] = "15/08/2017"
    with pytest.raises(DataError, match="engage_date fora do formato AAAA-MM-DD.*E138"):
        data.load(write_raw(tmp_path / "raw", sales_pipeline=rows))


def test_non_numeric_price_fails(tmp_path):
    products = [dict(row) for row in PRODUCTS]
    products[0]["sales_price"] = "caro"
    with pytest.raises(DataError, match="sales_price precisa ser um número"):
        data.load(write_raw(tmp_path / "raw", products=products))


def test_repeated_dimension_key_fails(tmp_path):
    with pytest.raises(DataError, match="sales_teams.csv tem sales_agent repetido: Ana Alfa"):
        data.load(write_raw(tmp_path / "raw", sales_teams=SALES_TEAMS + [SALES_TEAMS[0]]))


def test_divergent_hash_warns_everywhere(raw_dir, capsys):  # AC-1.5
    payload = views.seller_pipeline(data.load(raw_dir), "Ana Alfa")
    assert payload["meta"]["data_warning"] == policy.DATA_WARNING
    for args in (("check-data",), ("list", "--seller", "Ana Alfa"), ("explain", "--id", "E138")):
        code, out, _ = run_cli(raw_dir, capsys, *args)
        assert code == 0 and "dados diferentes da versão auditada" in out


@pytest.mark.parametrize("value", ["2017-12-30", "31/12/2017", "2017-02-30", "amanhã"])
def test_invalid_as_of_cites_minimum_and_format(raw_dir, value):  # AC-1.8
    frame = data.load(raw_dir).opportunities
    with pytest.raises(PolicyError) as error:
        triage.parse_as_of(frame, value)
    assert "2017-12-31" in str(error.value) and "AAAA-MM-DD" in str(error.value)


def test_invalid_as_of_in_cli_gives_no_list(raw_dir, capsys):  # AC-1.8
    code, out, err = run_cli(raw_dir, capsys, "list", "--seller", "Ana Alfa", "--as-of", "31/12/2017")
    assert code == 1 and out == "" and "AAAA-MM-DD" in err


def test_unknown_seller(raw_dir, capsys):
    with pytest.raises(NotFoundError, match="Fulano"):
        views.seller_pipeline(data.load(raw_dir), "Fulano")
    code, out, err = run_cli(raw_dir, capsys, "list", "--seller", "Fulano")
    assert code == 1 and out == "" and "não encontrado" in err


@pytest.mark.real_data
def test_real_data_has_no_warning(real_dataset):
    assert views.seller_pipeline(real_dataset, "Zane Levy")["meta"]["data_warning"] is None


@pytest.mark.real_data
@pytest.mark.parametrize("as_of, focar", [("2018-01-31", 160), ("2018-03-31", 34), ("2030-01-01", 0)])
def test_real_as_of_sensitivity(real_dataset, as_of, focar):  # AC-1.8
    frame = real_dataset.opportunities
    ctx = triage.resolve_context(frame, triage.parse_as_of(frame, as_of))
    counts = triage.summary(triage.classify(frame, ctx))
    assert counts[policy.FOCAR] == focar
    assert sum(counts.values()) == 2089
    assert ctx.cycle_limit_days == 138
