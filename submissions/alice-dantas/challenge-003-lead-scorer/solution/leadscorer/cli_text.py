"""Textos da CLI (pt-BR), montados a partir dos códigos do payload (fases F4 e F5 do contrato).

A CLI é uma camada de apresentação, como a tela: recebe chaves, códigos e números e
decide como dizer. Segue as regras do catálogo da tela (`web/copy/pt-BR.ts`): só
cita valores recebidos e não afirma mais do que o código diz. Um código sem texto
aqui quebra `tests/test_cli_text.py`.
"""
from __future__ import annotations

from typing import Any, Callable, Dict, Optional

import pandas as pd

from . import codes
from .fmt import fmt_date, fmt_int

Params = Dict[str, Any]

GROUP_LABELS = {"focar": "Focar", "revisar": "Revisar", "qualificar": "Qualificar", "nao_pontuavel": "Não pontuável"}

# Campo ausente → (motivo curto na linha, nome usado nas frases).
MISSING = {
    "product": ("sem produto", "o produto"),
    "sales_price": ("sem preço de tabela", "o preço de tabela"),
    "engage_date": ("sem data de engajamento", "a data de engajamento"),
}

NO_ACCOUNT = "sem cliente registrado"
NO_PRODUCT = "sem produto"
NO_BAND = "Sem valor de tabela"
OPEN = "abertas"
WARNING = "Aviso"
NEXT_STEP = "Próximo passo"
WHY_HERE = "Por que está aqui"
COLUMNS = ("ID", "Produto", "Cliente", "Preço", "Engajada em", "Idade")
DATA_WARNING = ("Atenção: dados diferentes da versão auditada; os números conferidos "
                "no PRD deixam de ser garantidos.")

# Ajuda dos comandos e rótulo de erro (a mensagem do erro vem do núcleo, para quem opera).
HELP = {
    "raw": "pasta com os CSVs",
    "check-data": "presença, hash e reconciliação dos dados",
    "list": 'lista "Onde focar" de um vendedor',
    "seller": 'nome exato, ex.: "Zane Levy"',
    "as-of": "data de referência AAAA-MM-DD (padrão: último fechamento)",
    "json": "imprime o payload da API",
    "explain": '"Por que está aqui" de uma oportunidade aberta',
    "id": "ex.: 01XZ9CRY",
}
ERROR = "Erro"

# `check-data`: diagnóstico dos CSVs, das junções e da reconciliação.
CHECK_DATA = {
    "folder": "Dados: {folder}",
    "hash": "Hash: {audited} de {total} arquivos iguais à versão auditada",
    "joins": "Junções (linhas após cada passo):",
    "unmatched": "  sem o mapa GTXPro → GTX Pro: {count} não casadas",
    "opportunities": "Oportunidades: {total} = {parts}",
    "open": "Abertas: {count}",
}
JOIN_STEPS = {"sales_pipeline": "sales_pipeline", "products": "+ products", "sales_teams": "+ sales_teams",
              "accounts": "+ accounts"}
JOIN_GAPS = {"null_price": "preço nulo", "null_manager": "manager nulo", "orphan_account": "conta sem cadastro"}


def iso_date(value: str) -> str:
    return fmt_date(pd.Timestamp(value))


def value_label(band: str) -> str:
    return f"valor de tabela {band}"


def _won_cycle(p: Params) -> str:
    text = (f"Referência do {p['product']}: em {p['percentile']}% das vendas ganhas, o ciclo foi de até "
            f"{p['p90_days']} dias (N = {fmt_int(p['won_n'])}). Esta está há {p['age_days']} dias; o maior ciclo "
            f"já fechado foi de {p['cycle_limit_days']} dias.")
    return f"{text} Poucos casos; leia como indicação." if p["few_cases"] else text


NO_CYCLE: Dict[str, Callable[[Params], str]] = {
    codes.CAUSE_NO_PRODUCT: lambda p: "Sem produto: não há ciclo de referência para comparar.",
    codes.CAUSE_NO_AGE: lambda p: "Sem data de engajamento: não há idade para comparar.",
    codes.CAUSE_NO_WINS: lambda p: (f"Sem vendas ganhas deste produto até {iso_date(p['as_of'])}: "
                                    "não há ciclo de referência para comparar."),
}

REASONS: Dict[str, Callable[[Params], str]] = {
    codes.AGE_WITHIN_CYCLE_LIMIT: lambda p: (
        f"{GROUP_LABELS['focar']} porque está em negociação há {p['age_days']} dias, dentro do maior ciclo "
        f"já fechado ({p['cycle_limit_days']} d)."),
    codes.AGE_ABOVE_CYCLE_LIMIT: lambda p: (
        f"{GROUP_LABELS['revisar']} porque está em negociação há {p['age_days']} dias, acima do maior ciclo "
        f"já fechado ({p['cycle_limit_days']} d)."),
    # A regra é o estágio, não a falta de data (o texto antigo dizia mais do que o código).
    codes.PROSPECTING_STAGE: lambda p: f"{GROUP_LABELS['qualificar']} porque ainda está em prospecção.",
    codes.MISSING_FIELD: lambda p: f"{GROUP_LABELS['nao_pontuavel']} porque falta {MISSING[p['field']][1]}.",
    codes.LIST_PRICE: lambda p: (
        f"Valor de tabela {fmt_int(p['sales_price'])} ({value_label(p['value_band'])}): preço de catálogo do "
        f"{p['product']}, não valor negociado."),
    codes.NO_PRODUCT: lambda p: "Sem valor de tabela: a oportunidade não tem produto.",
    codes.NO_LIST_PRICE: lambda p: f"Sem valor de tabela: o {p['product']} não tem preço no catálogo.",
    codes.WON_CYCLE_REFERENCE: _won_cycle,
    codes.NO_CYCLE_REFERENCE: lambda p: NO_CYCLE[p["cause"]](p),
    # A taxa das fechadas não prova que as abertas não se diferenciam: a frase só diz o que o código diz.
    codes.CLOSED_BASE_RATE: lambda p: (
        f"Não sabemos a chance de fechar desta oportunidade: cerca de {p['pct']}% das fechadas foram ganhas "
        f"({p['low_pct']}% a {p['high_pct']}% contando as abertas)."),
}

ACTIONS: Dict[str, Callable[[Params], str]] = {
    codes.WORK_HIGHEST_LIST_PRICE_FIRST: lambda p: (
        "Trabalhe primeiro os de maior valor de tabela; empates do mesmo produto valem o mesmo."),
    codes.CONFIRM_STILL_ACTIVE: lambda p: (
        "Confirme no CRM se segue ativa: idade acima do ciclo não prova que o negócio terminou."),
    codes.ADVANCE_PROSPECTING: lambda p: (
        "Ainda em prospecção: avance no CRM os de maior valor de tabela e registre a data de engajamento "
        "quando houver contato."),
    codes.FIX_MISSING_FIELD: lambda p: f"Corrija {MISSING[p['field']][1]} no CRM.",
    codes.FIX_MISSING_FIELDS: lambda p: "Corrija no CRM o campo indicado em cada oportunidade.",
}

# Ação de "comece por", em minúscula, no meio da frase de Focar vazio.
START_ACTIONS = {
    codes.CONFIRM_STILL_ACTIVE: "confirme no CRM quais seguem ativas",
    codes.ADVANCE_PROSPECTING: "avance no CRM as de maior valor de tabela",
    codes.FIX_MISSING_FIELDS: "corrija o cadastro no CRM",
}

EMPTY: Dict[str, Callable[[Params], str]] = {
    codes.GROUP_EMPTY: lambda p: "Nenhuma oportunidade neste grupo.",
    codes.START_WITH_GROUP: lambda p: (
        f"Nenhuma oportunidade dentro do ciclo observado (até {p['cycle_limit_days']} d). "
        f"Comece por {GROUP_LABELS[p['group']]}: {START_ACTIONS[p['action']]}."),
    codes.NO_OPEN_FOR_SELLER: lambda p: "Nenhuma oportunidade aberta para este vendedor.",
    codes.NO_OPEN_FOR_FILTER: lambda p: "Nenhuma oportunidade aberta para este filtro.",
}


def reason_text(reason: Dict[str, Any]) -> str:
    return REASONS[reason["code"]](reason["params"])


def action_text(action: Dict[str, Any]) -> str:
    return ACTIONS[action["code"]](action["params"])


def empty_text(empty: Dict[str, Any]) -> str:
    return EMPTY[empty["code"]](empty["params"])


# A legenda só descreve a ordem que conhece; uma ordem nova cai na versão curta.
KNOWN_WITHIN_GROUP = [codes.ORDER_VALUE_BAND, codes.ORDER_SALES_PRICE_DESC, codes.ORDER_OPPORTUNITY_ID]


def legend_text(ordering: Dict[str, Any]) -> str:
    groups = " → ".join(GROUP_LABELS[key] for key in ordering["group_order"])
    if ordering["within_group"] != KNOWN_WITHIN_GROUP:
        return f"Ordem: {groups}."
    age = "" if ordering["age_affects_order"] else "; a idade aparece, mas não muda a ordem"
    return f"Ordem: {groups}; em cada grupo, maior valor de tabela primeiro{age}."


def data_label(meta: Dict[str, Any]) -> str:
    return f"Dados até {iso_date(meta['as_of'])}"


def summary_counts(payload: Dict[str, Any]) -> str:
    return " + ".join(f"{payload['summary'][g['state']]} {GROUP_LABELS[g['state']]}" for g in payload["groups"])


def account_warning(summary: Dict[str, Any]) -> str:
    return f"{summary['without_account']} de {summary['total']} {NO_ACCOUNT}"


def client_text(item: Dict[str, Any]) -> str:
    return item["account"] or NO_ACCOUNT


def band_title(band: Optional[str]) -> str:
    return value_label(band).capitalize() if band else NO_BAND


def missing_short(field: str) -> str:
    return MISSING[field][0]


def tie_text(count: int, product: str, price: int) -> str:
    return f"{count} oportunidades de mesmo valor de tabela ({product}, {fmt_int(price)})"
