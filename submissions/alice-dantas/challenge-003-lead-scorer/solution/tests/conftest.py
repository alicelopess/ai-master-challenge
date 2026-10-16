"""Fixtures sintéticas (geradas em código) e acesso opcional aos CSVs reais."""
from __future__ import annotations

import csv
from datetime import date, timedelta
from pathlib import Path
from typing import Dict, List, Optional

import pytest

from leadscorer import data, policy

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


# Fechadas: maior ciclo = 138 d (W2); Lost em 2017-12-31 fixa o as_of padrão.
PIPELINE = [
    opp("W1", "Ana Alfa", "GTXPro", "Won", engaged=300, closed=241, account="Acme"),
    opp("W2", "Bruno Beta", "GTX Basic", "Won", engaged=200, closed=62, account="Beta Corp"),
    opp("L1", "Bruno Beta", "MG Special", "Lost", engaged=11, closed=0, account="Acme"),
    opp("E138", "Ana Alfa", "GTX Basic", "Engaging", engaged=138),
    opp("E139", "Ana Alfa", "GTX Basic", "Engaging", engaged=139, account="Acme"),
    opp("E050", "Ana Alfa", "GTX Basic", "Engaging", engaged=50),
    opp("EPP", "Ana Alfa", "GTX Plus Pro", "Engaging", engaged=10),
    opp("EGP", "Ana Alfa", "GTXPro", "Engaging", engaged=30, account="Beta Corp"),
    opp("EMG", "Ana Alfa", "MG Special", "Engaging", engaged=20),
    opp("P1", "Bruno Beta", "GTXPro", "Prospecting"),
]

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
