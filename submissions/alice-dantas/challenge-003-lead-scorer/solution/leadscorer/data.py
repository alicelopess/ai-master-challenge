"""Carga, normalização e junções dos CSVs do CRM (ADR-002).

Os CSVs são somente leitura. Cada junção é m:1 e registra as linhas depois
do passo, para provar que nenhuma oportunidade some em silêncio.
"""
from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Mapping, Optional

import pandas as pd

from . import policy

TABLES = ("sales_pipeline", "products", "sales_teams", "accounts")


@dataclass(frozen=True)
class JoinStep:
    label: str
    rows: int
    gap_label: Optional[str] = None
    gap_count: int = 0


@dataclass(frozen=True)
class Dataset:
    opportunities: pd.DataFrame
    steps: List[JoinStep]
    hashes: Dict[str, str]
    unmatched_without_map: int

    @property
    def audited(self) -> bool:
        return all(self.hashes[t] == policy.AUDITED_SHA256[t] for t in TABLES)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 16), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_table(raw_dir: Path, table: str) -> pd.DataFrame:
    # Tudo como texto; só a célula vazia vira nulo ("NA" continua sendo texto).
    return pd.read_csv(raw_dir / f"{table}.csv", dtype=str, keep_default_na=False, na_values=[""])


def unmatched_products(pipeline: pd.DataFrame, products: pd.DataFrame,
                       product_map: Mapping[str, str]) -> pd.DataFrame:
    labels = pipeline["product"].replace(dict(product_map))
    mask = pipeline["product"].notna() & ~labels.isin(products["product"])
    return pipeline.loc[mask, ["opportunity_id", "product"]]


def load(raw_dir: Path = policy.RAW_DIR) -> Dataset:
    raw = {t: read_table(raw_dir, t) for t in TABLES}
    hashes = {t: sha256(raw_dir / f"{t}.csv") for t in TABLES}

    pipeline = raw["sales_pipeline"].loc[:, list(policy.REQUIRED_COLUMNS["sales_pipeline"])]
    unmatched_without_map = len(unmatched_products(pipeline, raw["products"], {}))
    pipeline = pipeline.assign(product=pipeline["product"].replace(policy.PRODUCT_MAP))
    steps = [JoinStep("sales_pipeline", len(pipeline))]

    products = raw["products"].loc[:, ["product", "sales_price"]]
    products = products.assign(sales_price=products["sales_price"].astype("Int64"))
    frame = pipeline.merge(products, on="product", how="left", validate="m:1")
    steps.append(JoinStep("+ products", len(frame), "preço nulo", int(frame["sales_price"].isna().sum())))

    teams = raw["sales_teams"].loc[:, list(policy.REQUIRED_COLUMNS["sales_teams"])]
    frame = frame.merge(teams, on="sales_agent", how="left", validate="m:1")
    steps.append(JoinStep("+ sales_teams", len(frame), "manager nulo", int(frame["manager"].isna().sum())))

    accounts = raw["accounts"].loc[:, ["account"]]
    frame = frame.merge(accounts, on="account", how="left", validate="m:1", indicator=True)
    orphans = int((frame["account"].notna() & (frame["_merge"] == "left_only")).sum())
    frame = frame.drop(columns="_merge")
    steps.append(JoinStep("+ accounts", len(frame), "conta sem cadastro", orphans))

    frame["engage_date"] = pd.to_datetime(frame["engage_date"], format="%Y-%m-%d")
    frame["close_date"] = pd.to_datetime(frame["close_date"], format="%Y-%m-%d")
    return Dataset(frame, steps, hashes, unmatched_without_map)
