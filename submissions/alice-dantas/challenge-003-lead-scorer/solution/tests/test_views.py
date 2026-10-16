import json

import pytest

from leadscorer import data, views
from leadscorer.__main__ import main

LEGEND = (
    "Ordem: Focar → Revisar → Qualificar → Não pontuável; em cada grupo, maior "
    "valor de tabela primeiro; a idade aparece, mas não muda a ordem."
)


def group(payload, key):
    return next(g for g in payload["groups"] if g["state"] == key)


def test_summary_header_and_account_warning(raw_dir):
    payload = views.seller_pipeline(data.load(raw_dir), "Ana Alfa")
    assert payload["summary"] == {"total": 6, "focar": 5, "revisar": 1, "qualificar": 0, "nao_pontuavel": 0}
    assert payload["meta"]["data_label"] == "Dados até 31/12/2017"
    assert payload["legend"] == LEGEND
    assert payload["account_warning"] == "4 de 6 sem cliente registrado"


def test_every_item_is_identifiable_without_account(raw_dir):  # AC-2.7
    payload = views.seller_pipeline(data.load(raw_dir), "Ana Alfa")
    items = [entry for g in payload["groups"] for entry in g["items"]]
    assert all(entry["opportunity_id"] and entry["product"] and entry["engage_date"] for entry in items)
    no_account = [entry for entry in items if entry["account"] is None]
    assert no_account and all(entry["client"] == "sem cliente registrado" for entry in no_account)


def test_focar_and_revisar_show_age(raw_dir):
    payload = views.seller_pipeline(data.load(raw_dir), "Ana Alfa")
    ages = {e["opportunity_id"]: e["age_days"] for k in ("focar", "revisar") for e in group(payload, k)["items"]}
    assert ages["E138"] == 138 and ages["E139"] == 139


def test_empty_group_has_message(raw_dir):
    qualificar = group(views.seller_pipeline(data.load(raw_dir), "Ana Alfa"), "qualificar")
    assert qualificar["items"] == [] and qualificar["empty_message"]


def test_cli_text_has_header_legend_and_one_warning(raw_dir, capsys):
    assert main(["--raw", str(raw_dir), "list", "--seller", "Ana Alfa"]) == 0
    out = capsys.readouterr().out
    assert "Dados até 31/12/2017" in out and LEGEND in out
    assert sum(line.startswith("Aviso:") for line in out.splitlines()) == 1
    assert "2 oportunidades de mesmo valor de tabela (GTX Basic, 550)" in out
    assert "%" not in out


def test_cli_json_is_the_payload(raw_dir, capsys):
    assert main(["--raw", str(raw_dir), "list", "--seller", "Ana Alfa", "--json"]) == 0
    expected = json.loads(json.dumps(views.seller_pipeline(data.load(raw_dir), "Ana Alfa")))
    assert json.loads(capsys.readouterr().out) == expected


@pytest.mark.real_data
def test_zane_levy_focus_list(real_dataset):  # AC-2.1
    payload = views.seller_pipeline(real_dataset, "Zane Levy")
    assert payload["summary"] == {"total": 88, "focar": 31, "revisar": 57, "qualificar": 0, "nao_pontuavel": 0}
    assert payload["account_warning"] == "59 de 88 sem cliente registrado"
    focar = group(payload, "focar")["items"]
    assert [e["value_band"] for e in focar] == ["alto"] * 11 + ["médio"] * 17 + ["baixo"] * 3
    keys = [(-e["sales_price"], e["opportunity_id"]) for e in focar]
    assert keys == sorted(keys)
    assert focar[0]["opportunity_id"] == "01XZ9CRY" and focar[0]["age_days"] == 104
