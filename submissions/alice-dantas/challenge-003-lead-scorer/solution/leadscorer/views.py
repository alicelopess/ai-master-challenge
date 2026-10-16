"""Payload único para CLI, API e tela.

O payload é o contrato: a CLI (`--json`), a API e a tela recebem o mesmo
dicionário, o que garante a mesma lista em todas as saídas.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import pandas as pd

from . import explain, policy, triage
from .data import Dataset
from .errors import NotFoundError
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
        "data_warning": None if dataset.audited else policy.DATA_WARNING,
    }


def context(dataset: Dataset, as_of: Optional[triage.DateLike]) -> triage.Context:
    frame = dataset.opportunities
    return triage.resolve_context(frame, triage.parse_as_of(frame, as_of))


def item(row: pd.Series, info: Dict[str, Any]) -> Dict[str, Any]:
    account = _optional(row["account"])
    engage = _optional(row["engage_date"])
    age = _optional(row["age_days"])
    price = _optional(row["sales_price"])
    band = _optional(row["value_band"])
    missing = _optional(row["missing_field"])
    entry = {
        "opportunity_id": row["opportunity_id"],
        "sales_agent": row["sales_agent"],
        "product": _optional(row["product"]),
        "account": account,
        "client": account or policy.NO_ACCOUNT,
        "sales_price": None if price is None else int(price),
        "value_band": band,
        "value_label": None if band is None else f"valor de tabela {band}",
        "engage_date": None if engage is None else engage.date().isoformat(),
        "age_days": None if age is None else int(age),
        "state": row["state"],
        "missing_field": missing,
        "reason": None if missing is None else policy.MISSING_FIELDS[missing][0],
        "tie_size": int(row["tie_size"]),
    }
    entry["explanation"] = explain.explain(entry, info)
    entry["next_step"] = explain.next_step(entry)
    return entry


def empty_message(state: str, counts: Dict[str, int], ctx: triage.Context) -> Optional[str]:
    """Focar vazio aponta o primeiro grupo seguinte com oportunidades (Q-01)."""
    if counts[state]:
        return None
    if state == policy.FOCAR:
        start = next((s for s in policy.STATES[1:] if counts[s]), None)
        if start:
            return policy.FOCAR_EMPTY.format(limit=ctx.cycle_limit_days, group=start,
                                             action=policy.START_ACTIONS[start])
    return policy.EMPTY_GROUP


def portfolio(opps: pd.DataFrame, info: Dict[str, Any], ctx: triage.Context,
              no_open_message: str) -> Dict[str, Any]:
    """Resumo, aviso de conta e grupos de uma carteira já ordenada."""
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
            "empty_message": empty_message(state, counts, ctx) if total else policy.EMPTY_GROUP,
            "next_step": policy.NEXT_STEPS[state] if len(rows) else None,
            "items": [item(row, info) for _, row in rows.iterrows()],
        })
    return {
        "meta": info,
        "legend": policy.LEGEND,
        "summary": {"total": total, **{policy.STATE_KEYS[s]: counts[s] for s in policy.STATES}},
        "empty_message": None if total else no_open_message,
        "account_warning": f"{no_account} de {total} {policy.NO_ACCOUNT}" if no_account else None,
        "groups": groups,
    }


def sellers(dataset: Dataset) -> List[Dict[str, str]]:
    """Vendedores em ordem alfabética, sem nenhuma métrica: nunca um ranking de pessoas (RD-06)."""
    teams = dataset.teams.sort_values("sales_agent")
    return [{"name": row.sales_agent, "manager": row.manager, "office": row.regional_office}
            for row in teams.itertuples(index=False)]


def team_pipeline(dataset: Dataset, manager: Optional[str] = None, office: Optional[str] = None,
                  as_of: Optional[triage.DateLike] = None) -> Dict[str, Any]:
    """Carteira filtrada por manager e/ou escritório, na mesma ordem declarada.
    Filtro sem abertas (ou inexistente) devolve lista vazia com mensagem."""
    ctx = context(dataset, as_of)
    opps = triage.classify(dataset.opportunities, ctx)
    if manager:
        opps = opps[opps["manager"] == manager]
    if office:
        opps = opps[opps["regional_office"] == office]
    payload = portfolio(triage.order(opps), meta(dataset, ctx), ctx, policy.NO_OPEN_FOR_FILTER)
    return {"filter": {"manager": manager, "office": office}, **payload}


def seller_pipeline(dataset: Dataset, seller: str, as_of: Optional[triage.DateLike] = None) -> Dict[str, Any]:
    if seller not in dataset.sellers:
        raise NotFoundError(f"Vendedor '{seller}' não encontrado em sales_teams.csv.")
    ctx = context(dataset, as_of)
    opps = triage.classify(dataset.opportunities, ctx)
    opps = triage.order(opps[opps["sales_agent"] == seller])
    payload = portfolio(opps, meta(dataset, ctx), ctx, policy.NO_OPEN_FOR_SELLER)
    return {"seller": seller, **payload}


def opportunity_detail(dataset: Dataset, opportunity_id: str,
                       as_of: Optional[triage.DateLike] = None) -> Dict[str, Any]:
    """O item como aparece na lista do vendedor, com explicação e `meta`."""
    frame = dataset.opportunities
    match = frame[(frame["opportunity_id"] == opportunity_id) & frame["deal_stage"].isin(policy.OPEN_STAGES)]
    if match.empty:
        raise NotFoundError(f"Oportunidade aberta {opportunity_id} não encontrada.")
    payload = seller_pipeline(dataset, match["sales_agent"].iloc[0], as_of)
    entry = next(e for g in payload["groups"] for e in g["items"] if e["opportunity_id"] == opportunity_id)
    return {"meta": payload["meta"], "seller": payload["seller"], "item": entry}
