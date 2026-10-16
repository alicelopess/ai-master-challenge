from leadscorer import data, policy

from conftest import PIPELINE


def test_every_join_keeps_all_rows(raw_dir):
    dataset = data.load(raw_dir)
    assert [step.rows for step in dataset.steps] == [len(PIPELINE)] * 4
    assert len(dataset.opportunities) == len(PIPELINE)


def test_gtxpro_is_normalized_and_priced(raw_dir):
    frame = data.load(raw_dir).opportunities
    assert "GTXPro" not in set(frame["product"])
    assert frame["sales_price"].notna().all()
    assert frame.loc[frame["opportunity_id"] == "EGP", "sales_price"].item() == 4821


def test_gtxpro_regression_without_map(raw_dir):
    gtxpro_rows = sum(row["product"] == "GTXPro" for row in PIPELINE)
    dataset = data.load(raw_dir)
    assert dataset.unmatched_without_map == gtxpro_rows
    raw = {t: data.read_table(raw_dir, t) for t in data.TABLES}
    assert data.unmatched_products(raw["sales_pipeline"], raw["products"], policy.PRODUCT_MAP).empty


def test_load_is_read_only(raw_dir):
    before = {t: data.sha256(raw_dir / f"{t}.csv") for t in data.TABLES}
    data.load(raw_dir)
    assert {t: data.sha256(raw_dir / f"{t}.csv") for t in data.TABLES} == before


def test_fixture_is_not_the_audited_version(raw_dir):
    assert data.load(raw_dir).audited is False


def test_dates_are_parsed_and_empty_stays_null(raw_dir):
    frame = data.load(raw_dir).opportunities.set_index("opportunity_id")
    assert str(frame.loc["E138", "engage_date"].date()) == "2017-08-15"
    assert frame.loc[["P1"], "engage_date"].isna().all()
    assert frame.loc[["EPP"], "account"].isna().all()
