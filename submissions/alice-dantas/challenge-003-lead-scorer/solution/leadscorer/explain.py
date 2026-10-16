"""'Por que está aqui' como dado: motivos e próximo passo em código (P0-3).

Sem texto e sem LLM. Cada motivo é {code, role, params}: o papel diz o que ele
decidiu (grupo, ordem ou só contexto) e os parâmetros são os valores que a regra
usou, tirados do item e do `meta` do payload (RE-04). Quem apresenta (tela e CLI)
escreve o texto a partir do código.
"""
from __future__ import annotations

from typing import Any, Dict, List

from . import codes, policy

Reason = Dict[str, Any]


def _reason(code: str, role: str, **params: Any) -> Reason:
    return {"code": code, "role": role, "params": params}


def group_reason(item: Dict[str, Any], meta: Dict[str, Any]) -> Reason:
    """O que decidiu o grupo, com os valores usados na regra de `triage.classify`."""
    group = item["group"]
    if group == policy.NAO_PONTUAVEL:
        return _reason(codes.MISSING_FIELD, codes.ROLE_GROUP, field=item["missing_field"])
    if group == policy.QUALIFICAR:
        return _reason(codes.PROSPECTING_STAGE, codes.ROLE_GROUP, deal_stage=item["deal_stage"])
    code = codes.AGE_WITHIN_CYCLE_LIMIT if group == policy.FOCAR else codes.AGE_ABOVE_CYCLE_LIMIT
    return _reason(code, codes.ROLE_GROUP, age_days=item["age_days"], cycle_limit_days=meta["cycle_limit_days"])


def order_reason(item: Dict[str, Any]) -> Reason:
    """O que decidiu a ordem dentro do grupo: faixa e preço de tabela (`triage.order`)."""
    if item["product"] is None:
        return _reason(codes.NO_PRODUCT, codes.ROLE_ORDER)
    if item["sales_price"] is None:
        return _reason(codes.NO_LIST_PRICE, codes.ROLE_ORDER, product=item["product"])
    return _reason(codes.LIST_PRICE, codes.ROLE_ORDER, product=item["product"],
                   sales_price=item["sales_price"], value_band=item["value_band"])


def cycle_reason(item: Dict[str, Any], meta: Dict[str, Any]) -> Reason:
    """Referência de ciclo do produto: só contexto, não decide grupo nem ordem."""
    product, age = item["product"], item["age_days"]
    if product is None:
        return _reason(codes.NO_CYCLE_REFERENCE, codes.ROLE_CONTEXT, cause=codes.CAUSE_NO_PRODUCT)
    if age is None:
        return _reason(codes.NO_CYCLE_REFERENCE, codes.ROLE_CONTEXT, cause=codes.CAUSE_NO_AGE, product=product)
    ref = meta["cycle_references"][product]
    if ref["won_n"] == 0:
        return _reason(codes.NO_CYCLE_REFERENCE, codes.ROLE_CONTEXT, cause=codes.CAUSE_NO_WINS,
                       product=product, as_of=meta["as_of"])
    return _reason(codes.WON_CYCLE_REFERENCE, codes.ROLE_CONTEXT, product=product,
                   percentile=meta["cycle_percentile"], p90_days=ref["p90_days"], won_n=ref["won_n"],
                   few_cases=ref["won_n"] < meta["min_cases"], age_days=age,
                   cycle_limit_days=meta["cycle_limit_days"])


def base_rate_reason(meta: Dict[str, Any]) -> Reason:
    """Taxa de ganho das fechadas: igual para todas, só contexto."""
    return _reason(codes.CLOSED_BASE_RATE, codes.ROLE_CONTEXT, **meta["base_rate"])


def reasons(item: Dict[str, Any], meta: Dict[str, Any]) -> List[Reason]:
    return [group_reason(item, meta), order_reason(item), cycle_reason(item, meta), base_rate_reason(meta)]


def _action(code: str, **params: Any) -> Dict[str, Any]:
    return {"code": code, "params": params}


def next_action(item: Dict[str, Any]) -> Dict[str, Any]:
    if item["group"] == policy.NAO_PONTUAVEL:
        return _action(codes.FIX_MISSING_FIELD, field=item["missing_field"])
    return _action(policy.NEXT_ACTIONS[item["group"]])


def group_next_action(state: str) -> Dict[str, Any]:
    return _action(codes.FIX_MISSING_FIELDS if state == policy.NAO_PONTUAVEL else policy.NEXT_ACTIONS[state])
