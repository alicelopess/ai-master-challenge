"""Payload único para CLI, API e tela.

O payload é o contrato: a CLI (`--json`), a API e a tela recebem o mesmo
dicionário, o que garante a mesma lista em todas as saídas. Ele leva só chaves,
códigos e números (`codes.py`); o texto é de quem apresenta.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import pandas as pd

from . import codes, explain, policy, triage
from .data import Dataset
from .errors import NotFoundError


def _optional(value: Any) -> Any:
    return None if pd.isna(value) else value


def meta(dataset: Dataset, ctx: triage.Context) -> Dict[str, Any]:
    frame = dataset.opportunities
    return {
        "as_of": ctx.as_of.date().isoformat(),
        "cycle_limit_days": ctx.cycle_limit_days,
        "cycle_percentile": policy.CYCLE_PERCENTILE,
        "min_cases": policy.MIN_CASES,
        "cycle_references": triage.cycle_references(frame, ctx),
        "base_rate": triage.base_rate(frame, ctx),
        "audited": dataset.audited,
        "contract_version": codes.CONTRACT_VERSION,
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
        "sales_price": None if price is None else int(price),
        "value_band": band,
        "engage_date": None if engage is None else engage.date().isoformat(),
        "age_days": None if age is None else int(age),
        "group": row["state"],
        "deal_stage": row["deal_stage"],
        "missing_field": missing,
        "tie_size": int(row["tie_size"]),
    }
    entry["reasons"] = explain.reasons(entry, info)
    entry["next_action"] = explain.next_action(entry)
    return entry


def _code(code: str, **params: Any) -> Dict[str, Any]:
    return {"code": code, "params": params}


def empty_state(state: str, counts: Dict[str, int], ctx: triage.Context) -> Optional[Dict[str, Any]]:
    """Grupo vazio, ou Focar vazio apontando o primeiro grupo seguinte com oportunidades (Q-01)."""
    if counts[state]:
        return None
    if state == policy.FOCAR:
        start = next((s for s in policy.STATES[1:] if counts[s]), None)
        if start:
            return _code(codes.START_WITH_GROUP, group=start,
                         action=policy.START_ACTION_CODES[start], cycle_limit_days=ctx.cycle_limit_days)
    return _code(codes.GROUP_EMPTY)


def ordering() -> Dict[str, Any]:
    """A ordem de `triage.order` como dado: grupos na ordem dos estados e, dentro do
    grupo, faixa, preço decrescente e ID. A idade não entra."""
    return {"group_order": list(policy.STATES),
            "within_group": list(codes.ORDER_CRITERIA), "age_affects_order": False}


def portfolio(opps: pd.DataFrame, info: Dict[str, Any], ctx: triage.Context, no_open: str) -> Dict[str, Any]:
    """Resumo, ordem e grupos de uma carteira já ordenada. `no_open` é o código de
    carteira vazia (`codes.NO_OPEN_FOR_SELLER` ou `NO_OPEN_FOR_FILTER`)."""
    counts = triage.summary(opps)
    total = len(opps)
    no_account = int(opps["account"].isna().sum())
    groups = []
    for state in policy.STATES:
        rows = opps[opps["state"] == state]
        groups.append({
            "state": state,
            "count": counts[state],
            "empty": empty_state(state, counts, ctx) if total else _code(codes.GROUP_EMPTY),
            "next_action": explain.group_next_action(state) if len(rows) else None,
            "items": [item(row, info) for _, row in rows.iterrows()],
        })
    return {
        "meta": info,
        "ordering": ordering(),
        "summary": {"total": total, **counts, "without_account": no_account},
        "empty": None if total else _code(no_open),
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
    Filtro sem abertas (ou inexistente) devolve lista vazia com o código de vazio."""
    ctx = context(dataset, as_of)
    opps = triage.classify(dataset.opportunities, ctx)
    if manager:
        opps = opps[opps["manager"] == manager]
    if office:
        opps = opps[opps["regional_office"] == office]
    payload = portfolio(triage.order(opps), meta(dataset, ctx), ctx, codes.NO_OPEN_FOR_FILTER)
    return {"filter": {"manager": manager, "office": office}, **payload}


def seller_pipeline(dataset: Dataset, seller: str, as_of: Optional[triage.DateLike] = None) -> Dict[str, Any]:
    if seller not in dataset.sellers:
        raise NotFoundError(f"Vendedor '{seller}' não encontrado em sales_teams.csv.",
                            code=codes.SELLER_NOT_FOUND, seller=seller)
    ctx = context(dataset, as_of)
    opps = triage.classify(dataset.opportunities, ctx)
    opps = triage.order(opps[opps["sales_agent"] == seller])
    payload = portfolio(opps, meta(dataset, ctx), ctx, codes.NO_OPEN_FOR_SELLER)
    return {"seller": seller, **payload}


def opportunity_detail(dataset: Dataset, opportunity_id: str,
                       as_of: Optional[triage.DateLike] = None) -> Dict[str, Any]:
    """O item como aparece na lista do vendedor, com motivos e `meta`."""
    frame = dataset.opportunities
    match = frame[(frame["opportunity_id"] == opportunity_id) & frame["deal_stage"].isin(policy.OPEN_STAGES)]
    if match.empty:
        raise NotFoundError(f"Oportunidade aberta {opportunity_id} não encontrada.",
                            code=codes.OPPORTUNITY_NOT_FOUND, opportunity_id=opportunity_id)
    payload = seller_pipeline(dataset, match["sales_agent"].iloc[0], as_of)
    entry = next(e for g in payload["groups"] for e in g["items"] if e["opportunity_id"] == opportunity_id)
    return {"meta": payload["meta"], "seller": payload["seller"], "item": entry}
