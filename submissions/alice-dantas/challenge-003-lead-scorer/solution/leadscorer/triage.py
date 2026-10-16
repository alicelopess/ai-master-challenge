"""Estados, faixa de valor de tabela e ordem declarada (ADR-001).

Funções puras sobre o frame de `data.load`. Não há número contínuo nem
probabilidade: a prioridade é estado → faixa → preço de tabela → ID (só para
ordem estável). A idade é coluna exibida e não entra na chave.
"""
from __future__ import annotations

import math
import re
from dataclasses import dataclass
from datetime import date
from typing import Dict, Optional, Union

import numpy as np
import pandas as pd

from . import policy
from .errors import PolicyError

DateLike = Union[date, str, pd.Timestamp]


@dataclass(frozen=True)
class Context:
    as_of: pd.Timestamp
    cycle_limit_days: int


AS_OF_FORMAT = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def parse_as_of(frame: pd.DataFrame, value: Optional[DateLike]) -> Optional[pd.Timestamp]:
    """Valida o as_of vindo do usuário: AAAA-MM-DD e nunca antes do último
    fechamento (D-4), para não tirar da carteira deals fechados depois dele."""
    if value is None:
        return None
    minimum = frame["close_date"].max()
    minimum_iso = minimum.date().isoformat()
    if isinstance(value, str):
        try:
            if not AS_OF_FORMAT.match(value):
                raise ValueError(value)
            stamp = pd.Timestamp(value)
        except ValueError:
            raise PolicyError(f"Data inválida: '{value}'. Use o formato AAAA-MM-DD, "
                              f"a partir de {minimum_iso}.") from None
    else:
        stamp = pd.Timestamp(value)
    if stamp < minimum:
        raise PolicyError(f"Data {stamp.date().isoformat()} anterior ao último fechamento registrado. "
                          f"Use uma data a partir de {minimum_iso}, no formato AAAA-MM-DD.")
    return stamp


def resolve_context(frame: pd.DataFrame, as_of: Optional[DateLike] = None,
                    cycle_limit_days: Optional[int] = None) -> Context:
    """`as_of` padrão = maior `close_date`; limite padrão = maior ciclo das
    fechadas até o `as_of` (a régua nunca usa fechamentos posteriores)."""
    as_of_ts = frame["close_date"].max() if as_of is None else pd.Timestamp(as_of)
    if cycle_limit_days is None:
        closed = frame[frame["deal_stage"].isin(policy.CLOSED_STAGES) & (frame["close_date"] <= as_of_ts)]
        cycle_limit_days = int((closed["close_date"] - closed["engage_date"]).dt.days.max())
    return Context(as_of_ts, cycle_limit_days)


def half_up(value: float) -> int:
    return int(math.floor(value + 0.5))


def cycle_references(frame: pd.DataFrame, ctx: Context) -> Dict[str, Dict[str, Optional[int]]]:
    """P90 e N do ciclo das ganhas de cada produto, só com fechamentos até o as_of."""
    won = frame[(frame["deal_stage"] == "Won") & (frame["close_date"] <= ctx.as_of)]
    cycles = (won["close_date"] - won["engage_date"]).dt.days.groupby(won["product"])
    refs = {}
    for product in sorted(frame["product"].dropna().unique()):
        if product in cycles.groups:
            days = cycles.get_group(product)
            refs[product] = {"p90_days": half_up(days.quantile(policy.CYCLE_PERCENTILE / 100)),
                             "won_n": int(len(days))}
        else:
            refs[product] = {"p90_days": None, "won_n": 0}
    return refs


def base_rate(frame: pd.DataFrame, ctx: Context) -> Dict[str, int]:
    """Taxa de ganho das fechadas e a faixa que ela teria se as abertas
    fechassem todas perdidas (mínimo) ou todas ganhas (máximo)."""
    closed = frame[frame["deal_stage"].isin(policy.CLOSED_STAGES) & (frame["close_date"] <= ctx.as_of)]
    won = int((closed["deal_stage"] == "Won").sum())
    opens = int(frame["deal_stage"].isin(policy.OPEN_STAGES).sum())
    everything = len(closed) + opens
    return {
        "won": won, "closed": int(len(closed)), "open": opens,
        "pct": half_up(100 * won / len(closed)),
        "low_pct": half_up(100 * won / everything),
        "high_pct": half_up(100 * (won + opens) / everything),
    }


def _flag(condition: pd.Series) -> np.ndarray:
    """Condição booleana sem nulos (pd.NA conta como falso)."""
    return condition.fillna(False).to_numpy(dtype=bool)


def value_band(price: pd.Series) -> pd.Series:
    labels = [label for label, _ in policy.VALUE_BANDS]
    conditions = [_flag(price >= floor) for _, floor in policy.VALUE_BANDS]
    bands = pd.Series(np.select(conditions, labels, default=labels[-1]), index=price.index)
    return bands.where(price.notna(), None)


def missing_field(opps: pd.DataFrame) -> pd.Series:
    """Primeiro campo necessário que falta (RD-03), na ordem de MISSING_FIELDS."""
    needed = {
        "product": opps["product"].isna(),
        "sales_price": opps["sales_price"].isna(),
        "engage_date": (opps["deal_stage"] == "Engaging") & opps["engage_date"].isna(),
    }
    fields = list(policy.MISSING_FIELDS)
    found = np.select([_flag(needed[f]) for f in fields], fields, default="")
    return pd.Series(found, index=opps.index).replace("", None)


def classify(frame: pd.DataFrame, ctx: Context) -> pd.DataFrame:
    """Abertas com estado, faixa e idade. Só enxerga os campos permitidos."""
    is_open = frame["deal_stage"].isin(policy.OPEN_STAGES)
    opps = frame.loc[is_open, list(policy.CLASSIFICATION_FIELDS)].copy()

    opps["age_days"] = (ctx.as_of - opps["engage_date"]).dt.days.astype("Int64")
    opps["value_band"] = value_band(opps["sales_price"])
    opps["missing_field"] = missing_field(opps)
    engaging = opps["deal_stage"] == "Engaging"
    within = _flag(opps["age_days"] <= ctx.cycle_limit_days)
    opps["state"] = np.select(
        [opps["missing_field"].notna().to_numpy(), engaging & within, engaging,
         opps["deal_stage"] == "Prospecting"],
        [policy.NAO_PONTUAVEL, policy.FOCAR, policy.REVISAR, policy.QUALIFICAR],
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
    ordered["tie_size"] = ordered.groupby(["state", "product"], dropna=False)["opportunity_id"].transform("size")
    return ordered.reset_index(drop=True)


def summary(opps: pd.DataFrame) -> Dict[str, int]:
    counts = opps["state"].value_counts()
    return {state: int(counts.get(state, 0)) for state in policy.STATES}
