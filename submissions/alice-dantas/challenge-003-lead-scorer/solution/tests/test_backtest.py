import importlib.util

import numpy as np
import pandas as pd
import pytest

from leadscorer import data, policy

from conftest import PIPELINE, opp, skip_without_real_csvs, write_raw

spec =importlib.util.spec_from_file_location("backtest", policy.SOLUTION_DIR / "scripts" / "backtest.py")
backtest = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backtest)

LEGIT = [(name, ranker) for name, ranker, leak in backtest.RANKERS if not leak]
TRAP = next(ranker for _, ranker, leak in backtest.RANKERS if leak)


@pytest.fixture
def cut(tmp_path):
    # Fechadas que atravessam o corte de 2017-06-01 (213 dias antes do AS_OF da fixture).
    crossing = [
        opp("B1", "Ana Alfa", "GTX Basic", "Won", engaged=250, closed=100),
        opp("B2", "Bruno Beta", "MG Special", "Lost", engaged=240, closed=95),
        opp("B3", "Ana Alfa", "GTXPro", "Won", engaged=230, closed=40),
        opp("B4", "Bruno Beta", "GTX Plus Pro", "Lost", engaged=220, closed=150),
    ]
    raw = write_raw(tmp_path / "raw", sales_pipeline=PIPELINE + crossing)
    built = backtest.build_cut(data.load(raw).opportunities, backtest.close_values(raw), "2017-06-01")
    assert len(built.features) == 4 and built.outcome["won"].nunique() == 2
    return built


def test_legit_rankers_only_see_what_was_known(cut):  # ADR-001, validação 4
    assert not {"close_date", "close_value", "deal_stage", "won"} & set(cut.features.columns)
    assert set(cut.train.columns) == {"product", "won"}


def test_outcome_changes_never_move_legit_rankers(cut):
    before = {name: ranker(cut) for name, ranker in LEGIT}
    flipped = cut.outcome.assign(won=1 - cut.outcome["won"],
                                 close_date=cut.outcome["close_date"] + pd.Timedelta(days=31),
                                 close_value=cut.outcome["close_value"] * 9)
    changed = backtest.Cut(cut.as_of, cut.ctx, cut.train, cut.features, flipped)
    for name, ranker in LEGIT:
        assert np.array_equal(ranker(changed), before[name]), name
    assert not np.array_equal(TRAP(changed), TRAP(cut))  # só a armadilha depende do desfecho


def test_auc_basics():
    y = np.array([0, 0, 1, 1])
    assert backtest.auc(y, np.array([1.0, 2, 3, 4])) == 1.0
    assert backtest.auc(y, np.array([4.0, 3, 2, 1])) == 0.0
    assert backtest.auc(y, np.ones(4)) == 0.5
    assert backtest.auc_ci(y, np.ones(4)) == (0.5, 0.5)


def test_value_captured_counts_only_won_value_in_the_top():
    outcome = pd.DataFrame({"won": [1, 0, 1, 1, 0], "close_value": [100, 0, 300, 600, 0]})
    scores = np.array([5.0, 4, 3, 2, 1])  # top 20% de 5 = 1 negociação
    assert backtest.value_captured(scores, outcome) == pytest.approx(0.1)


@pytest.fixture(scope="module")
def real_result():
    skip_without_real_csvs()
    return backtest.run(policy.RAW_DIR)


@pytest.mark.real_data
def test_real_backtest_reproduces_the_audit_probe(real_result):  # data-audit.md, seção 2.9
    sizes = [(c["n_train"], c["n_test"]) for c in real_result["cuts"]]
    assert sizes == [(2038, 930), (2679, 970), (3306, 1139), (4091, 893), (4726, 935)]
    by_product = [r["auc"] for r in real_result["rows"] if r["ranker"] == "Taxa por produto"]
    assert by_product == [0.504, 0.533, 0.498, 0.500, 0.495]


@pytest.mark.real_data
def test_real_no_legit_ranker_beats_chance_and_trap_does(real_result):
    summary = {s["ranker"]: s for s in real_result["summary"]}
    for name, _ in LEGIT:
        assert summary[name]["cuts_ci_above_half"] == 0, name
        assert 0.45 <= summary[name]["auc_mean"] <= 0.55, name
    trap = summary["[VAZAMENTO] fechou no 3º mês do trimestre"]
    assert trap["cuts_ci_above_half"] == 5 and trap["auc_mean"] > 0.6


@pytest.mark.real_data
def test_real_value_captured_is_by_construction(real_result):
    summary = {s["ranker"]: s for s in real_result["summary"]}
    assert summary["Só valor de tabela"]["value_captured_mean"] > 2 * summary["Aleatório"]["value_captured_mean"]
    # Todo o teste estava em Focar em T: a regra coincide com "só valor".
    assert all(c["test_share_in_focar"] == 1.0 for c in real_result["cuts"])
    rule = [r["auc"] for r in real_result["rows"] if r["ranker"] == "Regra da ferramenta"]
    value = [r["auc"] for r in real_result["rows"] if r["ranker"] == "Só valor de tabela"]
    assert rule == value


@pytest.mark.real_data
def test_real_backtest_is_deterministic(real_result):
    assert backtest.run(policy.RAW_DIR) == real_result
