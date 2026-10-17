"""Fixtures sintéticas (geradas em código) e acesso opcional aos CSVs reais."""
from __future__ import annotations

import csv
import json
from datetime import date, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import pytest

from leadscorer import codes, data, policy

AS_OF = date(2017, 12, 31)


def ago(days: int) -> str:
    return (AS_OF - timedelta(days=days)).isoformat()


PRODUCTS = [
    {"product": "GTX Plus Pro", "series": "GTX", "sales_price": "5482"},
    {"product": "GTX Pro", "series": "GTX", "sales_price": "4821"},
    {"product": "GTX Basic", "series": "GTX", "sales_price": "550"},
    {"product": "MG Special", "series": "MG", "sales_price": "55"},
]

SALES_TEAMS = [
    {"sales_agent": "Ana Alfa", "manager": "Mara Um", "regional_office": "Central"},
    {"sales_agent": "Bruno Beta", "manager": "Mara Um", "regional_office": "Central"},
    {"sales_agent": "Carla Gama", "manager": "Nina Dois", "regional_office": "East"},
]

ACCOUNTS = [{"account": "Acme"}, {"account": "Beta Corp"}]


def opp(oid: str, agent: str, product: str, stage: str, engaged: Optional[int] = None,
        closed: Optional[int] = None, account: str = "") -> Dict[str, str]:
    """`engaged` e `closed` em dias antes do AS_OF; None deixa a data vazia."""
    return {
        "opportunity_id": oid, "sales_agent": agent, "product": product, "account": account,
        "deal_stage": stage,
        "engage_date": "" if engaged is None else ago(engaged),
        "close_date": "" if closed is None else ago(closed),
        "close_value": "" if closed is None else ("0" if stage == "Lost" else "100"),
    }


# Fechadas (regra A, ADR-006): as ganhas têm ciclos 10 e 110 d, P90 linear = 100 d exato (L1); o
# maior ciclo fechado é 138 d, de uma perdida (L2). Se L1 usasse todas as fechadas, daria 132.
# L1 (Lost) em 2017-12-31 fixa o as_of padrão.
PIPELINE = [
    opp("W1", "Ana Alfa", "GTXPro", "Won", engaged=300, closed=290, account="Acme"),
    opp("W2", "Bruno Beta", "GTX Basic", "Won", engaged=200, closed=90, account="Beta Corp"),
    opp("L1", "Bruno Beta", "MG Special", "Lost", engaged=138, closed=0, account="Acme"),
    opp("E138", "Ana Alfa", "GTX Basic", "Engaging", engaged=138),
    opp("E139", "Ana Alfa", "GTX Basic", "Engaging", engaged=139, account="Acme"),
    opp("E050", "Ana Alfa", "GTX Basic", "Engaging", engaged=50),
    opp("EPP", "Ana Alfa", "GTX Plus Pro", "Engaging", engaged=10),
    opp("EGP", "Ana Alfa", "GTXPro", "Engaging", engaged=30, account="Beta Corp"),
    opp("EMG", "Ana Alfa", "MG Special", "Engaging", engaged=20),
    opp("P1", "Bruno Beta", "GTXPro", "Prospecting"),
    opp("E100", "Ana Alfa", "GTX Basic", "Engaging", engaged=100),
    opp("E101", "Ana Alfa", "GTX Basic", "Engaging", engaged=101, account="Beta Corp"),
]
L1_DAYS, L2_DAYS = 100, 138

# Casos de borda: sem data, sem produto, produto sem preço, Prospecting com data e dois vendedores
# com Focar vazio: um começa por Acompanhar (120 d) e outro por Revisar (200 d).
EDGE_PRODUCTS = PRODUCTS + [{"product": "GTX Ultra", "series": "GTX", "sales_price": ""}]
EDGE_TEAMS = SALES_TEAMS + [
    {"sales_agent": "Davi Delta", "manager": "Nina Dois", "regional_office": "East"},
    {"sales_agent": "Eva Epsilon", "manager": "Nina Dois", "regional_office": "East"},
]
EDGE_PIPELINE = PIPELINE + [
    opp("N1", "Bruno Beta", "GTX Basic", "Engaging"),
    opp("N2", "Bruno Beta", "", "Prospecting"),
    opp("U1", "Bruno Beta", "GTX Ultra", "Engaging", engaged=20),
    opp("PE", "Ana Alfa", "GTX Basic", "Prospecting", engaged=40),
    opp("A120", "Davi Delta", "GTX Basic", "Engaging", engaged=120),
    opp("R200", "Eva Epsilon", "GTXPro", "Engaging", engaged=200),
]
EDGE_TABLES = {"sales_pipeline": EDGE_PIPELINE, "products": EDGE_PRODUCTS, "sales_teams": EDGE_TEAMS}

TABLE_ROWS = {
    "sales_pipeline": PIPELINE, "products": PRODUCTS,
    "sales_teams": SALES_TEAMS, "accounts": ACCOUNTS,
}


def write_raw(directory: Path, **tables: List[Dict[str, str]]) -> Path:
    """Escreve as 4 tabelas em `directory`; cada kwarg substitui uma tabela padrão."""
    directory.mkdir(parents=True, exist_ok=True)
    for name, default in TABLE_ROWS.items():
        rows = tables.get(name, default)
        fields = list((rows or default)[0].keys())
        with open(directory / f"{name}.csv", "w", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=fields)
            writer.writeheader()
            writer.writerows(rows)
    return directory


@pytest.fixture
def raw_dir(tmp_path: Path) -> Path:
    return write_raw(tmp_path / "raw")


# Resultado sintético de scripts/backtest.py: todas as estratégias, a armadilha e o recorte
# sem as que nunca fecham, com números distintos por código (a tela tem de citar os do payload).
# Como no real, sem as que nunca fecham a regra servida fica atrás de "só preço" (veredito reference_behind).
REFERENCE_VAL = 0.58
EVIDENCE_VALUES = {codes.RANKER_GLOBAL_RATE: 0.25, codes.RANKER_PRODUCT_RATE: 0.14, codes.RANKER_RANDOM: 0.23,
                   codes.RANKER_LIST_PRICE_ONLY: 0.54, codes.RANKER_AGE_NEWEST_FIRST: 0.27,
                   codes.RANKER_AGE_MAX_CYCLE_ONLY: 0.57, codes.RANKER_AGE_P90_THEN_MAX_CYCLE: REFERENCE_VAL,
                   codes.RANKER_LEAK_QUARTER_END: 0.45}
WITHOUT_VALUES = {codes.RANKER_LIST_PRICE_ONLY: 0.79, codes.RANKER_AGE_MAX_CYCLE_ONLY: 0.79,
                  codes.RANKER_AGE_P90_THEN_MAX_CYCLE: 0.78}


def evidence_entry(code: str, val_at_k: float, with_ci: bool = True, reference: float = REFERENCE_VAL,
                   spread: float = 0.01) -> Dict[str, object]:
    leak = code == codes.RANKER_LEAK_QUARTER_END
    entry: Dict[str, object] = {"ranker": f"nome de {code}", "code": code, "leak": leak,
                                "auc_mean": round(0.5 + val_at_k / 10, 3), "auc_min": 0.5, "auc_max": 0.6}
    if with_ci:
        entry.update(cuts_ci_above_half=2 if leak else 1, cuts_ci_below_half=0)
    entry.update(p_at_k=0.4, lift_at_k=1.05, val_at_k=val_at_k)
    if code != codes.SERVED_RANKER:
        entry["cuts_val_above_reference"] = int(val_at_k > reference)
        if not leak:
            delta = round(val_at_k - reference, 3)
            entry.update(d_p_at_k=0.01, d_p_low=0.0, d_p_high=0.02, d_val_at_k=delta,
                         d_val_low=round(delta - spread, 3), d_val_high=round(delta + spread, 3))
    return entry


EVIDENCE_RESULTS = {
    "design": {"cuts": ["2017-03-31", "2017-04-30"], "horizon_days": 90, "top_k": 10, "seed": 1, "smooth_m": 20,
               "n_boot": 10, "n_boot_sellers": 20, "fixed_limits": [90], "observations": 30,
               "unique_opportunities": 20, "audited_data": False, "served_rule": codes.SERVED_RANKER},
    "cuts": [], "rows": [], "limits": [], "walk_forward": {"steps": [], "mean": {}},
    "summary": [evidence_entry(code, value) for code, value in EVIDENCE_VALUES.items()],
    "without_no_outcome": [evidence_entry(code, value, with_ci=False, reference=0.78, spread=0.005)
                           for code, value in WITHOUT_VALUES.items()],
}


def write_evidence(path: Path, result: Optional[Dict[str, object]] = None) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(EVIDENCE_RESULTS if result is None else result), encoding="utf-8")
    return path


@pytest.fixture
def evidence_path(tmp_path: Path) -> Path:
    return write_evidence(tmp_path / "processed" / "backtest_results.json")


def skip_without_real_csvs() -> None:
    missing = [t for t in data.TABLES if not (policy.RAW_DIR / f"{t}.csv").exists()]
    if missing:
        pytest.skip(
            f"CSVs reais ausentes em data/raw/ ({', '.join(missing)}): "
            "ver data/raw/README.md; os testes com fixtures sintéticas continuam valendo"
        )


def pytest_runtest_setup(item: pytest.Item) -> None:
    # O marcador basta: todo teste `real_data` é pulado com aviso se faltarem os CSVs.
    if item.get_closest_marker("real_data"):
        skip_without_real_csvs()


@pytest.fixture(scope="session")
def real_dataset() -> data.Dataset:
    skip_without_real_csvs()
    return data.load(policy.RAW_DIR)
