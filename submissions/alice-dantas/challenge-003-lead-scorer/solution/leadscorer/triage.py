"""Estados, faixa de valor de tabela e ordem declarada (ADR-001).

Funções puras sobre o frame de `data.load`. Não há número contínuo nem
probabilidade: a prioridade é estado → faixa → preço de tabela → ID (só para
ordem estável). A idade é coluna exibida e não entra na chave.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Dict, Optional, Union

import numpy as np
import pandas as pd

from . import policy

DateLike = Union[date, str, pd.Timestamp]


@dataclass(frozen=True)
class Context:
    as_of: pd.Timestamp
    cycle_limit_days: int


def resolve_context(frame: pd.DataFrame, as_of: Optional[DateLike] = None,
                    cycle_limit_days: Optional[int] = None) -> Context:
    """`as_of` padrão = maior `close_date`; limite padrão = maior ciclo das
    fechadas até o `as_of` (a régua nunca usa fechamentos posteriores)."""
    as_of_ts = frame["close_date"].max() if as_of is None else pd.Timestamp(as_of)
    if cycle_limit_days is None:
        closed = frame[frame["deal_stage"].isin(policy.CLOSED_STAGES) & (frame["close_date"] <= as_of_ts)]
        cycle_limit_days = int((closed["close_date"] - closed["engage_date"]).dt.days.max())
    return Context(as_of_ts, cycle_limit_days)


def value_band(price: pd.Series) -> pd.Series:
    labels = [label for label, _ in policy.VALUE_BANDS]
    conditions = [price >= floor for _, floor in policy.VALUE_BANDS]
    return pd.Series(np.select(conditions, labels, default=labels[-1]), index=price.index)


def classify(frame: pd.DataFrame, ctx: Context) -> pd.DataFrame:
    """Abertas com estado, faixa e idade. Só enxerga os campos permitidos."""
    is_open = frame["deal_stage"].isin(policy.OPEN_STAGES)
    opps = frame.loc[is_open, list(policy.CLASSIFICATION_FIELDS)].copy()

    opps["age_days"] = (ctx.as_of - opps["engage_date"]).dt.days.astype("Int64")
    opps["value_band"] = value_band(opps["sales_price"])
    engaging = opps["deal_stage"] == "Engaging"
    within = opps["age_days"] <= ctx.cycle_limit_days
    opps["state"] = np.select(
        [engaging & within, engaging, opps["deal_stage"] == "Prospecting"],
        [policy.FOCAR, policy.REVISAR, policy.QUALIFICAR],
        default=policy.NAO_PONTUAVEL,
    )
    return opps


def order(opps: pd.DataFrame) -> pd.DataFrame:
    """Estado → faixa → preço decrescente → ID; `tie_size` marca empates."""
    state_rank = {s: i for i, s in enumerate(policy.STATES)}
    band_rank = {label: i for i, (label, _) in enumerate(policy.VALUE_BANDS)}
    keyed = opps.assign(
        _state=opps["state"].map(state_rank),
        _band=opps["value_band"].map(band_rank),
        _price=-opps["sales_price"].astype("float"),
    )
    ordered = keyed.sort_values(["_state", "_band", "_price", "opportunity_id"], kind="mergesort")
    ordered = ordered.drop(columns=["_state", "_band", "_price"])
    ordered["tie_size"] = ordered.groupby(["state", "product"])["opportunity_id"].transform("size")
    return ordered.reset_index(drop=True)


def summary(opps: pd.DataFrame) -> Dict[str, int]:
    counts = opps["state"].value_counts()
    return {state: int(counts.get(state, 0)) for state in policy.STATES}
