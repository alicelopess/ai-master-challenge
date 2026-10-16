"""Parâmetros e premissas da solução, sem lógica.

Faixas de valor e limite de ciclo são política provisória (U-06): sem
validação da Head de RevOps, editáveis aqui sem tocar no motor.
"""
from __future__ import annotations

from pathlib import Path

SOLUTION_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = SOLUTION_DIR / "data" / "raw"
DATASET_URL = "https://www.kaggle.com/datasets/agungpambudi/crm-sales-predictive-analytics"

# Colunas que a solução usa de cada tabela; as demais são ignoradas.
REQUIRED_COLUMNS = {
    "sales_pipeline": (
        "opportunity_id", "sales_agent", "product", "account",
        "deal_stage", "engage_date", "close_date",
    ),
    "products": ("product", "sales_price"),
    "sales_teams": ("sales_agent", "manager", "regional_office"),
    "accounts": ("account",),
}

# SHA-256 da versão auditada (data-audit.md, A§7).
AUDITED_SHA256 = {
    "sales_pipeline": "825ce8f6c32d4009548b468df3173d55a46fd73f2531f532c5459371dc52adf2",
    "products": "7c1c8cbbdb6d4c286902e1985eeb529a36366d6a43f43cd4a93c4b1da2a6eb84",
    "sales_teams": "aeff1272ebe196f5a27e3fc0578aa27abf48ed9ae461aa344fb95990e5ad8bd1",
    "accounts": "e5242324768a563fc632cddfed49a29acbbf2892b8a3c6453cc9650de9ae0358",
}

# Grafias do pipeline que não batem com o catálogo (A§2.4).
PRODUCT_MAP = {"GTXPro": "GTX Pro"}

OPEN_STAGES = ("Engaging", "Prospecting")
CLOSED_STAGES = ("Won", "Lost")

DATA_WARNING = ("Atenção: dados diferentes da versão auditada; os números conferidos "
                "no PRD deixam de ser garantidos.")

# Únicos campos que a classificação enxerga (RD-02). `close_date` entra só
# na régua de ciclo, e só de fechadas até o as_of.
CLASSIFICATION_FIELDS = (
    "opportunity_id", "sales_agent", "manager", "regional_office",
    "product", "sales_price", "account", "deal_stage", "engage_date",
)

FOCAR, REVISAR, QUALIFICAR, NAO_PONTUAVEL = "Focar", "Revisar", "Qualificar", "Não pontuável"
STATES = (FOCAR, REVISAR, QUALIFICAR, NAO_PONTUAVEL)
# Chaves estáveis (sem acento) do payload da CLI e da API.
STATE_KEYS = {FOCAR: "focar", REVISAR: "revisar", QUALIFICAR: "qualificar", NAO_PONTUAVEL: "nao_pontuavel"}

NO_ACCOUNT = "sem cliente registrado"
EMPTY_GROUP = "Nenhuma oportunidade neste grupo."
NO_OPEN_FOR_SELLER = "Nenhuma oportunidade aberta para este vendedor."
NO_OPEN_FOR_FILTER = "Nenhuma oportunidade aberta para este filtro."

# Campo que falta → (motivo, nome no texto). A ordem define qual é citado primeiro.
MISSING_FIELDS = {
    "product": ("sem produto", "o produto"),
    "sales_price": ("sem preço de tabela", "o preço de tabela"),
    "engage_date": ("sem data de engajamento", "a data de engajamento"),
}

# Focar vazio aponta o primeiro grupo seguinte que tem oportunidades (Q-01).
FOCAR_EMPTY = "Nenhuma oportunidade dentro do ciclo observado (até {limit} d). Comece por {group}: {action}."
START_ACTIONS = {
    REVISAR: "confirme no CRM quais seguem ativas",
    QUALIFICAR: "avance no CRM as de maior valor de tabela",
    NAO_PONTUAVEL: "corrija o cadastro no CRM",
}

# Referência de ciclo por produto: P90 das ganhas até o as_of (quantil
# linear, arredondado para dia inteiro); abaixo de MIN_CASES, só indicação.
CYCLE_PERCENTILE = 90
MIN_CASES = 30

# Valor de tabela: alto >= 3.000; médio de 500 a 2.999; baixo < 500.
VALUE_BANDS = (("alto", 3000), ("médio", 500), ("baixo", 0))

LEGEND = (
    "Ordem: Focar → Revisar → Qualificar → Não pontuável; em cada grupo, maior "
    "valor de tabela primeiro; a idade aparece, mas não muda a ordem."
)

# Próximo passo por estado (PRD, P0-3). A ferramenta só lê o CRM (RE-03).
NEXT_STEPS = {
    FOCAR: "Trabalhe primeiro os de maior valor de tabela; empates do mesmo produto valem o mesmo.",
    REVISAR: "Confirme no CRM se segue ativa: idade acima do ciclo não prova que o negócio terminou.",
    QUALIFICAR: ("Ainda em prospecção: avance no CRM os de maior valor de tabela e registre a "
                 "data de engajamento quando houver contato."),
    NAO_PONTUAVEL: "Corrija no CRM o campo indicado em cada oportunidade.",
}
# Por item, Não pontuável cita o campo: "Corrija <campo> no CRM."
FIX_FIELD_STEP = "Corrija {field} no CRM."

# Nenhum texto mostrado ao vendedor pode conter estes termos (AC-3.8).
FORBIDDEN_TERMS = ("probabilidade", "perdida", "encerre", "prioridade alta", "chance alta", "score")
