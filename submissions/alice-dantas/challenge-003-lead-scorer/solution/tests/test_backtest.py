import importlib.util

import numpy as np
import pandas as pd
import pytest

from leadscorer import data, policy, triage
from leadscorer.errors import PolicyError

from conftest import PIPELINE, opp, skip_without_real_csvs, write_raw

spec =importlib.util.spec_from_file_location("backtest", policy.SOLUTION_DIR / "scripts" / "backtest.py")
backtest = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backtest)

LEGIT = [(name, ranker) for name, ranker, leak in backtest.RANKERS + backtest.LIMITS if not leak]
TRAP = next(ranker for _, ranker, leak in backtest.RANKERS if leak)
CUT = "2017-06-01"  # 213 dias antes do AS_OF da fixture; T + 90 d = 213 − 90 = 123 dias antes


def load_cut(tmp_path, extra, as_of=CUT):
    raw = write_raw(tmp_path / "raw", sales_pipeline=PIPELINE + extra)
    return backtest.build_cut(data.load(raw).opportunities, backtest.close_values(raw), as_of)


@pytest.fixture
def cut(tmp_path):
    # Abertas em 2017-06-01: quatro que fecham depois do corte e uma que nunca fecha.
    crossing = [
        opp("B1", "Ana Alfa", "GTX Basic", "Won", engaged=250, closed=150),      # ganha na janela
        opp("B2", "Bruno Beta", "MG Special", "Lost", engaged=240, closed=180),
        opp("B3", "Ana Alfa", "GTXPro", "Won", engaged=230, closed=40),          # ganha depois da janela
        opp("B4", "Bruno Beta", "GTX Plus Pro", "Lost", engaged=220, closed=150),
        opp("Z1", "Ana Alfa", "GTX Plus Pro", "Engaging", engaged=260),          # nunca fecha
    ]
    built = load_cut(tmp_path, crossing)
    assert built.outcome["won"].nunique() == 2
    return built


def test_population_is_every_engaged_deal_still_open_at_the_cut(cut):
    # W1 fechou antes; E050 e as demais abertas engajaram depois; P1 (Prospecting) não tem data.
    assert list(cut.features["opportunity_id"]) == ["B1", "B2", "B3", "B4", "Z1"]
    assert list(cut.outcome["no_outcome"]) == [False, False, False, False, True]


def test_outcome_is_a_win_inside_the_horizon(cut):
    outcome = cut.outcome.set_index(cut.features["opportunity_id"])
    assert outcome.loc["B1", "won"] == 1 and outcome.loc["B1", "won_value"] == 100
    assert outcome.loc["B3", "won"] == 0 and outcome.loc["B3", "won_value"] == 0  # ganhou depois de 90 d
    assert outcome.loc["Z1", "won"] == 0


def test_horizon_must_end_inside_the_data(tmp_path):
    with pytest.raises(PolicyError, match="último fechamento"):
        load_cut(tmp_path, [], as_of="2017-10-15")


def test_legit_rankers_only_see_what_was_known(cut):  # ADR-001, validação 4
    assert not {"close_date", "close_value", "deal_stage", "won"} & set(cut.features.columns)
    assert set(cut.train.columns) == {"product", "won", "cycle_days"}


def test_outcome_changes_never_move_legit_rankers(cut):
    before = {name: ranker(cut) for name, ranker in LEGIT}
    flipped = cut.outcome.assign(won=1 - cut.outcome["won"],
                                 close_date=cut.outcome["close_date"] + pd.Timedelta(days=31),
                                 won_value=cut.outcome["won_value"] * 9,
                                 no_outcome=~cut.outcome["no_outcome"])
    changed = backtest.Cut(cut.as_of, cut.ctx, cut.train, cut.features, flipped)
    for name, ranker in LEGIT:
        assert np.array_equal(ranker(changed), before[name]), name
    assert not np.array_equal(TRAP(changed), TRAP(cut))  # só a armadilha depende do desfecho


def hand_cut(ages, prices, won_cycles, limit):
    as_of = pd.Timestamp("2017-06-30")
    features = pd.DataFrame({
        "opportunity_id": [f"O{i}" for i in range(len(ages))], "sales_agent": "Ana Alfa",
        "product": "GTX Basic", "sales_price": prices,
        "engage_date": [as_of - pd.Timedelta(days=a) for a in ages]})
    train = pd.DataFrame({"product": "GTX Basic", "won": 1, "cycle_days": won_cycles})
    return backtest.Cut(as_of, triage.Context(as_of, limit), train, features, pd.DataFrame())


def test_rule_a_splits_at_the_floor_of_the_won_p90():
    # P90 linear de 1..100 = 90,1 → idade até 90 no 1º grupo; maior ciclo 138 fecha o 2º.
    cut = hand_cut(ages=[90, 91, 138, 139], prices=[550, 5482, 5482, 9999], won_cycles=range(1, 101), limit=138)
    assert backtest.won_cycle_p90(cut) == 90
    assert list(backtest.rule_a(cut)) == [2e6 + 550, 1e6 + 5482, 1e6 + 5482, 9999]
    # A regra atual põe tudo até 138 d no mesmo grupo e ordena só por preço.
    assert list(backtest.tool_rule(cut)) == [2e6 + 550, 2e6 + 5482, 2e6 + 5482, 9999]


def test_auc_basics():
    y = np.array([0, 0, 1, 1])
    assert backtest.auc(y, np.array([1.0, 2, 3, 4])) == 1.0
    assert backtest.auc(y, np.array([4.0, 3, 2, 1])) == 0.0
    assert backtest.auc(y, np.ones(4)) == 0.5
    assert backtest.auc_ci(y, np.ones(4)) == (0.5, 0.5)


def test_top_k_counts_won_value_in_the_window_against_the_oracle(cut):
    # Ana Alfa: Z1 (5.482, nunca fecha), B3 (4.821, ganha depois de 90 d), B1 (550, ganha na janela).
    by_price = backtest.top_k(cut, backtest.table_value(cut), k=2).set_index("seller")
    assert by_price.loc["Ana Alfa", ["hits", "value", "oracle"]].tolist() == [0, 0, 100]
    assert by_price.loc["Ana Alfa", "expected_hits"] == pytest.approx(2 / 3)
    # Mais nova primeiro: B3 (17 d) e B1 (37 d) → a lista acha o único valor ganho.
    youngest = backtest.top_k(cut, backtest.youngest_first(cut), k=2).set_index("seller")
    assert youngest.loc["Ana Alfa", ["hits", "value", "oracle"]].tolist() == [1, 100, 100]
    assert list(backtest.top_k(cut, backtest.table_value(cut), k=3)["seller"]) == ["Ana Alfa"]  # Bruno tem 2


def test_list_metrics_sum_every_seller_cut():
    lists = pd.DataFrame({"seller": ["A", "B"], "hits": [3, 1], "expected_hits": [2.0, 2.0],
                          "value": [300.0, 0.0], "oracle": [400.0, 100.0]})
    assert backtest.list_metrics(lists, k=10) == {"p_at_k": 0.2, "lift_at_k": 1.0, "val_at_k": 0.6}


def test_delta_of_a_list_against_itself_is_zero():
    lists = pd.DataFrame({"seller": ["A", "B", "C"], "hits": [3, 1, 4], "expected_hits": [2.0, 2.0, 3.0],
                          "value": [300.0, 0.0, 50.0], "oracle": [400.0, 100.0, 80.0]})
    delta = backtest.delta_ci(lists, lists)
    assert all(value == 0 for value in delta.values())


@pytest.fixture(scope="module")
def real_result():
    skip_without_real_csvs()
    return backtest.run(policy.RAW_DIR)


@pytest.mark.real_data
def test_real_population_includes_deals_without_outcome(real_result):
    assert [c["n_test"] for c in real_result["cuts"]] == [1330, 1618, 1535, 1686, 2257, 2265, 2409]
    assert real_result["cuts"][-1]["share_no_outcome"] == 0.612
    assert all(c["cycle_limit_days"] == 138 for c in real_result["cuts"])


@pytest.mark.real_data
def test_real_value_only_rankers_stay_at_chance(real_result):
    summary = {s["ranker"]: s for s in real_result["summary"]}
    for name in ("Taxa por produto", "Aleatório", "Só valor de tabela"):
        assert summary[name]["cuts_ci_above_half"] == 0, name
        assert 0.45 <= summary[name]["auc_mean"] <= 0.55, name
    trap = summary["[VAZAMENTO] fechou no 3º mês do trimestre"]
    assert trap["cuts_ci_above_half"] == len(backtest.CUTS)


@pytest.mark.real_data
def test_real_rule_a_beats_the_current_rule_only_with_deals_without_outcome(real_result):
    summary = {s["ranker"]: s for s in real_result["summary"]}
    current, rule_a = summary[backtest.REFERENCE], summary[backtest.RULE_A]
    assert (current["auc_mean"], rule_a["auc_mean"]) == (0.574, 0.604)
    assert (current["val_at_k"], rule_a["val_at_k"]) == (0.569, 0.584)
    assert rule_a["d_val_low"] > 0 and rule_a["d_p_low"] > 0
    # A regra atual já supera "só valor": a divisão por idade agora tem rótulo.
    assert current["val_at_k"] > summary["Só valor de tabela"]["val_at_k"]
    without = {s["ranker"]: s for s in real_result["without_no_outcome"]}
    assert without[backtest.RULE_A]["d_val_high"] < 0


@pytest.mark.real_data
def test_real_backtest_is_deterministic(real_result):
    assert backtest.run(policy.RAW_DIR) == real_result
