"""Payload único para CLI, API e tela.

O payload é o contrato: a CLI (`--json`), a API e a tela recebem o mesmo
dicionário, o que garante a mesma lista em todas as saídas.
"""
from __future__ import annotations

from typing import Any, Dict, Optional

import pandas as pd

from . import explain, policy, triage
from .data import Dataset
from .fmt import fmt_date


def _optional(value: Any) -> Any:
    return None if pd.isna(value) else value


def meta(dataset: Dataset, ctx: triage.Context) -> Dict[str, Any]:
    frame = dataset.opportunities
    return {
        "as_of": ctx.as_of.date().isoformat(),
        "as_of_label": fmt_date(ctx.as_of),
        "data_label": f"Dados até {fmt_date(ctx.as_of)}",
        "cycle_limit_days": ctx.cycle_limit_days,
        "cycle_percentile": policy.CYCLE_PERCENTILE,
        "min_cases": policy.MIN_CASES,
        "cycle_references": triage.cycle_references(frame, ctx),
        "base_rate": triage.base_rate(frame, ctx),
        "audited": dataset.audited,
    }


def item(row: pd.Series, info: Dict[str, Any]) -> Dict[str, Any]:
    account = _optional(row["account"])
    engage = _optional(row["engage_date"])
    age = _optional(row["age_days"])
    entry = {
        "opportunity_id": row["opportunity_id"],
        "sales_agent": row["sales_agent"],
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
    entry["explanation"] = explain.explain(entry, info)
    entry["next_step"] = explain.next_step(entry["state"])
    return entry


def seller_pipeline(dataset: Dataset, seller: str, as_of: Optional[triage.DateLike] = None) -> Dict[str, Any]:
    frame = dataset.opportunities
    ctx = triage.resolve_context(frame, as_of)
    info = meta(dataset, ctx)
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
            "next_step": policy.NEXT_STEPS.get(state) if len(rows) else None,
            "items": [item(row, info) for _, row in rows.iterrows()],
        })

    return {
        "meta": info,
        "seller": seller,
        "legend": policy.LEGEND,
        "summary": {"total": total, **{policy.STATE_KEYS[s]: counts[s] for s in policy.STATES}},
        "account_warning": f"{no_account} de {total} {policy.NO_ACCOUNT}" if no_account else None,
        "groups": groups,
    }


def opportunity_detail(dataset: Dataset, opportunity_id: str,
                       as_of: Optional[triage.DateLike] = None) -> Dict[str, Any]:
    """O item como aparece na lista do vendedor, com explicação e `meta`."""
    frame = dataset.opportunities
    match = frame[(frame["opportunity_id"] == opportunity_id) & frame["deal_stage"].isin(policy.OPEN_STAGES)]
    if match.empty:
        raise LookupError(f"Oportunidade aberta {opportunity_id} não encontrada.")
    payload = seller_pipeline(dataset, match["sales_agent"].iloc[0], as_of)
    entry = next(e for g in payload["groups"] for e in g["items"] if e["opportunity_id"] == opportunity_id)
    return {"meta": payload["meta"], "seller": payload["seller"], "item": entry}
