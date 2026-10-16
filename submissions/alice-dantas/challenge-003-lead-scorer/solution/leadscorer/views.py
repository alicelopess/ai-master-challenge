"""Formatação e payload único para CLI, API e tela.

O payload é o contrato: a CLI (`--json`), a API e a tela recebem o mesmo
dicionário, o que garante a mesma lista em todas as saídas.
"""
from __future__ import annotations

from typing import Any, Dict, Optional

import pandas as pd

from . import policy, triage
from .data import Dataset


def fmt_int(value: int) -> str:
    """Inteiro com separador de milhar brasileiro: 8800 -> '8.800'."""
    return f"{int(value):,}".replace(",", ".")


def fmt_date(value: pd.Timestamp) -> str:
    return value.strftime("%d/%m/%Y")


def _optional(value: Any) -> Any:
    return None if pd.isna(value) else value


def meta(dataset: Dataset, ctx: triage.Context) -> Dict[str, Any]:
    return {
        "as_of": ctx.as_of.date().isoformat(),
        "data_label": f"Dados até {fmt_date(ctx.as_of)}",
        "cycle_limit_days": ctx.cycle_limit_days,
        "audited": dataset.audited,
    }


def item(row: pd.Series) -> Dict[str, Any]:
    account = _optional(row["account"])
    engage = _optional(row["engage_date"])
    age = _optional(row["age_days"])
    return {
        "opportunity_id": row["opportunity_id"],
        "product": row["product"],
        "account": account,
        "client": account or policy.NO_ACCOUNT,
        "sales_price": int(row["sales_price"]),
        "value_band": row["value_band"],
        "value_label": f"valor de tabela {row['value_band']}",
        "engage_date": None if engage is None else engage.date().isoformat(),
        "age_days": None if age is None else int(age),
        "state": row["state"],
        "tie_size": int(row["tie_size"]),
    }


def seller_pipeline(dataset: Dataset, seller: str, as_of: Optional[triage.DateLike] = None) -> Dict[str, Any]:
    frame = dataset.opportunities
    ctx = triage.resolve_context(frame, as_of)
    opps = triage.classify(frame, ctx)
    opps = triage.order(opps[opps["sales_agent"] == seller])
    counts = triage.summary(opps)
    total = len(opps)
    no_account = int(opps["account"].isna().sum())

    groups = []
    for state in policy.STATES:
        rows = opps[opps["state"] == state]
        groups.append({
            "state": policy.STATE_KEYS[state],
            "label": state,
            "count": counts[state],
            "empty_message": None if len(rows) else policy.EMPTY_GROUP,
            "items": [item(row) for _, row in rows.iterrows()],
        })

    return {
        "meta": meta(dataset, ctx),
        "seller": seller,
        "legend": policy.LEGEND,
        "summary": {"total": total, **{policy.STATE_KEYS[s]: counts[s] for s in policy.STATES}},
        "account_warning": f"{no_account} de {total} {policy.NO_ACCOUNT}" if no_account else None,
        "groups": groups,
    }
