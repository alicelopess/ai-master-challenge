import pandas as pd
import pytest

from leadscorer import data, policy, triage

from conftest import PIPELINE, write_raw


def classified(raw_dir):
    frame = data.load(raw_dir).opportunities
    ctx = triage.resolve_context(frame)
    return ctx, triage.order(triage.classify(frame, ctx))


def test_default_context_is_last_close_and_longest_cycle(raw_dir):
    ctx, _ = classified(raw_dir)
    assert ctx.as_of == pd.Timestamp("2017-12-31")
    assert ctx.cycle_limit_days == 138


def test_cycle_boundary_138_focar_139_revisar(raw_dir):  # AC-1.9
    _, opps = classified(raw_dir)
    states = opps.set_index("opportunity_id")["state"]
    assert states["E138"] == policy.FOCAR
    assert states["E139"] == policy.REVISAR


def test_partition_covers_every_open_once(raw_dir):
    _, opps = classified(raw_dir)
    open_ids = [row["opportunity_id"] for row in PIPELINE if row["deal_stage"] in policy.OPEN_STAGES]
    assert sorted(opps["opportunity_id"]) == sorted(open_ids)
    assert sum(triage.summary(opps).values()) == len(open_ids)


def test_declared_order_state_band_price_id(raw_dir):
    _, opps = classified(raw_dir)
    assert list(opps["opportunity_id"]) == ["EPP", "EGP", "E050", "E138", "EMG", "E139", "P1"]
    assert list(opps["value_band"][:5]) == ["alto", "alto", "médio", "médio", "baixo"]


def test_classification_never_sees_close_fields(raw_dir):
    frame = data.load(raw_dir).opportunities
    ctx = triage.resolve_context(frame)
    opps = triage.classify(frame, ctx)
    assert not {"close_date", "close_value"} & set(opps.columns)


def test_age_does_not_order(tmp_path):  # AC-2.2
    def ordered_ids(rows, name):
        frame = data.load(write_raw(tmp_path / name, sales_pipeline=rows)).opportunities
        ctx = triage.resolve_context(frame)
        return list(triage.order(triage.classify(frame, ctx))["opportunity_id"])

    swapped = [dict(row) for row in PIPELINE]
    by_id = {row["opportunity_id"]: row for row in swapped}
    by_id["E050"]["engage_date"], by_id["E138"]["engage_date"] = (
        by_id["E138"]["engage_date"], by_id["E050"]["engage_date"])
    assert ordered_ids(swapped, "swapped") == ordered_ids(PIPELINE, "original")


def test_same_state_and_product_is_a_tie(raw_dir):  # AC-2.3
    _, opps = classified(raw_dir)
    ties = opps.set_index("opportunity_id")["tie_size"]
    assert ties["E050"] == ties["E138"] == 2
    assert ties["EPP"] == 1


@pytest.mark.parametrize("price, band", [(3000, "alto"), (2999, "médio"), (500, "médio"), (499, "baixo")])
def test_value_band_thresholds(price, band):
    assert triage.value_band(pd.Series([price])).item() == band


@pytest.mark.real_data
def test_real_partition_and_bands(real_dataset):  # AC-1.1
    frame = real_dataset.opportunities
    ctx = triage.resolve_context(frame)
    opps = triage.order(triage.classify(frame, ctx))
    assert ctx.as_of == pd.Timestamp("2017-12-31")
    assert ctx.cycle_limit_days == 138
    assert triage.summary(opps) == {policy.FOCAR: 298, policy.REVISAR: 1291,
                                    policy.QUALIFICAR: 500, policy.NAO_PONTUAVEL: 0}
    focar = opps[opps["state"] == policy.FOCAR]["value_band"].value_counts().to_dict()
    assert focar == {"alto": 123, "médio": 113, "baixo": 62}
    per_seller = opps.groupby("sales_agent")["state"].size()
    assert per_seller.sum() == 2089


@pytest.mark.real_data
def test_real_order_is_monotonic_within_each_state(real_dataset):
    frame = real_dataset.opportunities
    opps = triage.order(triage.classify(frame, triage.resolve_context(frame)))
    for _, group in opps.groupby("state", sort=False):
        prices = list(group["sales_price"])
        assert prices == sorted(prices, reverse=True)
