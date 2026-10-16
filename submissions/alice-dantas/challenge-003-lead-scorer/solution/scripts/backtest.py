"""Backtest temporal da ordenação (PRD, seção 5; ADR-001, validações 7 e 8).

Para cada corte T: treino = fechadas até T; teste = negociações já engajadas em T
que fecharam depois de T (mesmo desenho da sonda de data-audit.md, seção 2.9).
Os ordenadores legítimos só recebem o que se sabia em T: produto, preço de tabela,
data de engajamento e o histórico de fechadas até T. O desfecho (ganho, valor e
data de fechamento) fica à parte e só serve para medir. A única exceção, marcada
como vazamento, é a armadilha do mês de fechamento.

Habilidade (AUC, com IC95% por bootstrap) e valor capturado ficam em tabelas
separadas: ordenar por preço captura mais valor por construção, sem prever nada.

Rodar (em solution/): `.venv/bin/python scripts/backtest.py`
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, List, Tuple

import numpy as np
import pandas as pd
from scipy import stats

SOLUTION_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SOLUTION_DIR))

from leadscorer import data, policy, triage  # noqa: E402
from leadscorer.errors import LeadScorerError  # noqa: E402

SEED = 20260101
CUTS = ("2017-05-31", "2017-06-30", "2017-07-31", "2017-08-31", "2017-09-30")
SMOOTH_M = 20
N_BOOT = 300
TOP_SHARE = 0.20
OUT_DIR = SOLUTION_DIR / "data" / "processed"


@dataclass(frozen=True)
class Cut:
    as_of: pd.Timestamp
    ctx: triage.Context
    train: pd.DataFrame      # fechadas até T: product, won
    features: pd.DataFrame   # o que se sabia em T sobre cada negociação do teste
    outcome: pd.DataFrame    # desfecho do teste, só para medir


def close_values(raw_dir: Path) -> pd.Series:
    """`close_value` vem direto do CSV: o núcleo nem carrega esse campo."""
    pipeline = data.read_table(raw_dir, "sales_pipeline")
    return pd.to_numeric(pipeline.set_index("opportunity_id")["close_value"])


def build_cut(frame: pd.DataFrame, values: pd.Series, as_of: str) -> Cut:
    stamp = pd.Timestamp(as_of)
    closed = frame[frame["deal_stage"].isin(policy.CLOSED_STAGES)]
    train = closed[closed["close_date"] <= stamp]
    train = pd.DataFrame({"product": train["product"], "won": (train["deal_stage"] == "Won").astype(int)})
    test = closed[(closed["engage_date"] <= stamp) & (closed["close_date"] > stamp)]
    test = test.sort_values("opportunity_id").reset_index(drop=True)
    features = test.loc[:, ["opportunity_id", "product", "sales_price", "engage_date"]]
    outcome = pd.DataFrame({
        "won": (test["deal_stage"] == "Won").astype(int),
        "close_date": test["close_date"],
        "close_value": test["opportunity_id"].map(values).fillna(0),
    })
    return Cut(stamp, triage.resolve_context(frame, stamp), train, features, outcome)


# Ordenadores legítimos: recebem a negociação como era em T, nunca o desfecho.
def global_rate(cut: Cut) -> np.ndarray:
    return np.full(len(cut.features), cut.train["won"].mean())


def product_rate(cut: Cut) -> np.ndarray:
    p0 = cut.train["won"].mean()
    grouped = cut.train.groupby("product")["won"].agg(["sum", "count"])
    smoothed = (grouped["sum"] + SMOOTH_M * p0) / (grouped["count"] + SMOOTH_M)
    return cut.features["product"].map(smoothed).fillna(p0).to_numpy(float)


def random_order(cut: Cut) -> np.ndarray:
    return np.random.default_rng(SEED + cut.as_of.month).random(len(cut.features))


def table_value(cut: Cut) -> np.ndarray:
    return cut.features["sales_price"].to_numpy(float)


def tool_rule(cut: Cut) -> np.ndarray:
    """A ordem da ferramenta em T: Focar (idade até o maior ciclo fechado até T)
    antes de Revisar e, dentro do estado, maior preço de tabela primeiro."""
    age = (cut.as_of - cut.features["engage_date"]).dt.days
    focar = (age <= cut.ctx.cycle_limit_days).to_numpy()
    return focar * 1e6 + cut.features["sales_price"].to_numpy(float)


# Armadilha: usa a data de fechamento, que só existe depois do resultado.
def closing_month_trap(cut: Cut) -> np.ndarray:
    month_of_quarter = (cut.outcome["close_date"].dt.month - 1) % 3 + 1
    return (month_of_quarter == 3).astype(float).to_numpy()


RANKERS: List[Tuple[str, Callable[[Cut], np.ndarray], bool]] = [
    ("Taxa global", global_rate, False),
    ("Taxa por produto", product_rate, False),
    ("Aleatório", random_order, False),
    ("Só valor de tabela", table_value, False),
    ("Regra da ferramenta", tool_rule, False),
    ("[VAZAMENTO] fechou no 3º mês do trimestre", closing_month_trap, True),
]


def auc(y: np.ndarray, scores: np.ndarray) -> float:
    """AUC por soma de postos (Mann-Whitney); empates contam 0,5."""
    positives = int(y.sum())
    negatives = len(y) - positives
    ranks = stats.rankdata(scores)
    return float((ranks[y == 1].sum() - positives * (positives + 1) / 2) / (positives * negatives))


def auc_ci(y: np.ndarray, scores: np.ndarray) -> Tuple[float, float]:
    if np.all(scores == scores[0]):
        return 0.5, 0.5
    rng = np.random.default_rng(SEED)
    values = []
    for _ in range(N_BOOT):
        idx = rng.integers(0, len(y), len(y))
        if 0 < y[idx].sum() < len(idx):
            values.append(auc(y[idx], scores[idx]))
    return float(np.percentile(values, 2.5)), float(np.percentile(values, 97.5))


def value_captured(scores: np.ndarray, outcome: pd.DataFrame) -> float:
    """Parcela do valor ganho que cai nos TOP_SHARE primeiros da ordem
    (empates desfeitos pelo ID, como na ferramenta)."""
    order = np.lexsort((np.arange(len(scores)), -scores))
    top = order[: math.ceil(TOP_SHARE * len(scores))]
    won_value = outcome["close_value"].where(outcome["won"] == 1, 0).to_numpy(float)
    return float(won_value[top].sum() / won_value.sum())


def run(raw_dir: Path = policy.RAW_DIR) -> Dict:
    dataset = data.load(raw_dir)
    values = close_values(raw_dir)
    cuts, rows = [], []
    for as_of in CUTS:
        cut = build_cut(dataset.opportunities, values, as_of)
        y = cut.outcome["won"].to_numpy()
        age = (cut.as_of - cut.features["engage_date"]).dt.days
        cuts.append({"cut": as_of, "n_train": len(cut.train), "n_test": len(cut.features),
                     "test_win_rate": round(float(y.mean()), 3), "cycle_limit_days": cut.ctx.cycle_limit_days,
                     "test_share_in_focar": round(float((age <= cut.ctx.cycle_limit_days).mean()), 3)})
        for name, ranker, leak in RANKERS:
            scores = ranker(cut)
            low, high = auc_ci(y, scores)
            rows.append({"cut": as_of, "ranker": name, "leak": leak, "auc": round(auc(y, scores), 3),
                         "ci_low": round(low, 3), "ci_high": round(high, 3),
                         "value_captured_top20": round(value_captured(scores, cut.outcome), 3)})
    summary = []
    for name, _, leak in RANKERS:
        mine = [r for r in rows if r["ranker"] == name]
        summary.append({
            "ranker": name, "leak": leak,
            "auc_mean": round(float(np.mean([r["auc"] for r in mine])), 3),
            "auc_min": min(r["auc"] for r in mine), "auc_max": max(r["auc"] for r in mine),
            "cuts_ci_above_half": sum(r["ci_low"] > 0.5 for r in mine),
            "cuts_ci_below_half": sum(r["ci_high"] < 0.5 for r in mine),
            "value_captured_mean": round(float(np.mean([r["value_captured_top20"] for r in mine])), 3),
        })
    return {"design": {"cuts": list(CUTS), "seed": SEED, "smooth_m": SMOOTH_M, "n_boot": N_BOOT,
                       "top_share": TOP_SHARE, "audited_data": dataset.audited},
            "cuts": cuts, "rows": rows, "summary": summary}


def pct(value: float) -> str:
    return f"{100 * value:.1f}%".replace(".", ",")


def dec(value: float) -> str:
    return f"{value:.3f}".replace(".", ",")


def markdown(result: Dict) -> str:
    cuts = result["design"]["cuts"]
    lines = ["# Backtest temporal da ordenação", "",
             "Gerado por `scripts/backtest.py` (não editar à mão). Desenho e leitura: README, seção Resultados.", "",
             "## Cortes", "", "| Corte | Treino (fechadas até T) | Teste (engajadas até T, fechadas depois) "
             "| Taxa de ganho do teste | Limite de ciclo em T | Teste em Focar em T |",
             "| --- | --- | --- | --- | --- | --- |"]
    lines += [f"| {c['cut']} | {c['n_train']} | {c['n_test']} | {pct(c['test_win_rate'])} | "
              f"{c['cycle_limit_days']} d | {pct(c['test_share_in_focar'])} |" for c in result["cuts"]]
    lines += ["", "Nenhuma negociação fechada passou de 138 dias, então todo o teste estava em Focar em T: a "
              "divisão Focar/Revisar não tem rótulo para ser avaliada aqui, e a regra coincide com \"só valor\"."]
    lines += ["", "## Habilidade: AUC (IC95%) por corte", "",
              "| Ordenador | " + " | ".join(cuts) + " | Média |", "| --- |" + " --- |" * (len(cuts) + 1)]
    for s in result["summary"]:
        cells = [f"{dec(r['auc'])} ({dec(r['ci_low'])}–{dec(r['ci_high'])})"
                 for r in result["rows"] if r["ranker"] == s["ranker"]]
        lines.append(f"| {s['ranker']} | " + " | ".join(cells) + f" | {dec(s['auc_mean'])} |")
    lines += ["", f"## Valor capturado: parcela do valor ganho nos {int(100 * TOP_SHARE)}% primeiros da ordem", "",
              "| Ordenador | " + " | ".join(cuts) + " | Média |", "| --- |" + " --- |" * (len(cuts) + 1)]
    for s in result["summary"]:
        cells = [pct(r["value_captured_top20"]) for r in result["rows"] if r["ranker"] == s["ranker"]]
        lines.append(f"| {s['ranker']} | " + " | ".join(cells) + f" | {pct(s['value_captured_mean'])} |")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--raw", type=Path, default=policy.RAW_DIR, help="pasta com os CSVs")
    parser.add_argument("--no-write", action="store_true", help="só imprime, sem gravar em data/processed/")
    args = parser.parse_args()
    try:
        result = run(args.raw)
    except LeadScorerError as error:
        print(f"Erro: {error}", file=sys.stderr)
        return 1
    report = markdown(result)
    print(report)
    if not args.no_write:
        (OUT_DIR / "backtest_results.json").write_text(
            json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (OUT_DIR / "backtest_report.md").write_text(report, encoding="utf-8")
        print(f"Gravado em {data.display_path(OUT_DIR)}/backtest_results.json e backtest_report.md")
    return 0


if __name__ == "__main__":
    sys.exit(main())
