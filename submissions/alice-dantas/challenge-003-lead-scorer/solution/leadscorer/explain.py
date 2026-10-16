"""'Por que está aqui': frases de modelo fixo preenchidas com campos (P0-3).

Sem LLM. Cada frase é {factor, text, fields}, e todo número do texto sai de
`fields`, que por sua vez vêm do item e do `meta` do payload (RE-04).
"""
from __future__ import annotations

from typing import Any, Dict, List

from . import policy
from .fmt import fmt_int

Sentence = Dict[str, Any]


def _sentence(factor: str, text: str, **fields: Any) -> Sentence:
    return {"factor": factor, "text": text, "fields": fields}


def position(item: Dict[str, Any], meta: Dict[str, Any]) -> Sentence:
    state, age, limit = item["state"], item["age_days"], meta["cycle_limit_days"]
    if state in (policy.FOCAR, policy.REVISAR):
        where = "dentro" if state == policy.FOCAR else "acima"
        return _sentence(
            "position",
            f"{state} porque está em negociação há {age} dias, {where} do maior ciclo já fechado ({limit} d).",
            state=state, age_days=age, cycle_limit_days=limit,
        )
    if state == policy.NAO_PONTUAVEL:
        field = item["missing_field"]
        return _sentence("position", f"{state} porque falta {policy.MISSING_FIELDS[field][1]}.",
                         state=state, missing_field=field, reason=item["reason"])
    return _sentence("position", f"{state} porque ainda não tem data de engajamento.",
                     state=state, engage_date=None)


def table_value(item: Dict[str, Any]) -> Sentence:
    price, band, product = item["sales_price"], item["value_band"], item["product"]
    if product is None:
        return _sentence("table_value", "Sem valor de tabela: a oportunidade não tem produto.",
                         product=None, sales_price=None)
    if price is None:
        return _sentence("table_value", f"Sem valor de tabela: o {product} não tem preço no catálogo.",
                         product=product, sales_price=None)
    return _sentence(
        "table_value",
        f"Valor de tabela {fmt_int(price)} (valor de tabela {band}): preço de catálogo "
        f"do {item['product']}, não valor negociado.",
        product=item["product"], sales_price=price, value_band=band,
    )


def cycle(item: Dict[str, Any], meta: Dict[str, Any]) -> Sentence:
    product, age = item["product"], item["age_days"]
    if product is None:
        return _sentence("cycle", "Sem produto: não há ciclo de referência para comparar.", product=None)
    if age is None:
        return _sentence("cycle", "Sem data de engajamento: não há idade para comparar.", engage_date=None)
    ref = meta["cycle_references"][product]
    if ref["won_n"] == 0:
        return _sentence(
            "cycle",
            f"Sem vendas ganhas deste produto até {meta['as_of_label']}: "
            "não há ciclo de referência para comparar.",
            product=product, won_n=0, as_of=meta["as_of_label"],
        )
    percentile, limit = meta["cycle_percentile"], meta["cycle_limit_days"]
    text = (f"Referência do {product}: em {percentile}% das vendas ganhas, o ciclo foi de até "
            f"{ref['p90_days']} dias (N = {fmt_int(ref['won_n'])}). Esta está há {age} dias; "
            f"o maior ciclo já fechado foi de {limit} dias.")
    if ref["won_n"] < meta["min_cases"]:
        text += " Poucos casos; leia como indicação."
    return _sentence("cycle", text, product=product, cycle_percentile=percentile,
                     p90_days=ref["p90_days"], won_n=ref["won_n"], age_days=age,
                     cycle_limit_days=limit)


def base_rate(meta: Dict[str, Any]) -> Sentence:
    rate = meta["base_rate"]
    return _sentence(
        "base_rate",
        f"Não sabemos a chance de fechar: cerca de {rate['pct']}% das fechadas foram ganhas "
        f"({rate['low_pct']}% a {rate['high_pct']}% contando as abertas), e isso não "
        "diferencia uma da outra.",
        base_rate_pct=rate["pct"], range_low_pct=rate["low_pct"], range_high_pct=rate["high_pct"],
    )


def explain(item: Dict[str, Any], meta: Dict[str, Any]) -> List[Sentence]:
    return [position(item, meta), table_value(item), cycle(item, meta), base_rate(meta)]


def next_step(item: Dict[str, Any]) -> str:
    if item["state"] == policy.NAO_PONTUAVEL:
        return policy.FIX_FIELD_STEP.format(field=policy.MISSING_FIELDS[item["missing_field"]][1])
    return policy.NEXT_STEPS[item["state"]]
