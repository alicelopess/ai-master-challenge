"""Códigos do contrato: o que a regra decidiu, como dado (plano do contrato, fase F2).

O núcleo entrega chaves, códigos e números; o texto de cada código é de quem
apresenta (a tela e a CLI). Um código novo precisa entrar aqui, no schema da API
(`api/schemas.py`) e nos catálogos de texto, ou os testes de contrato falham.
"""
from __future__ import annotations

CONTRACT_VERSION = 4  # 2: códigos ao lado dos textos (F2); 3: sem os campos de texto (F5);
                      # 4: /api/evidence, /api/rules e o resumo por vendedor na carteira da equipe

# Papel de cada motivo: o que ele influenciou na posição da oportunidade.
ROLE_GROUP = "group"      # decidiu o grupo
ROLE_ORDER = "order"      # decidiu a ordem dentro do grupo
ROLE_CONTEXT = "context"  # só contexto: não decide nada
ROLES = (ROLE_GROUP, ROLE_ORDER, ROLE_CONTEXT)

# Motivos (item.reasons[].code)
AGE_WITHIN_CYCLE_LIMIT = "age_within_cycle_limit"
AGE_ABOVE_CYCLE_LIMIT = "age_above_cycle_limit"
PROSPECTING_STAGE = "prospecting_stage"
MISSING_FIELD = "missing_field"
LIST_PRICE = "list_price"
NO_PRODUCT = "no_product"
NO_LIST_PRICE = "no_list_price"
WON_CYCLE_REFERENCE = "won_cycle_reference"
NO_CYCLE_REFERENCE = "no_cycle_reference"
CLOSED_BASE_RATE = "closed_base_rate"
REASON_CODES = (AGE_WITHIN_CYCLE_LIMIT, AGE_ABOVE_CYCLE_LIMIT, PROSPECTING_STAGE, MISSING_FIELD, LIST_PRICE,
                NO_PRODUCT, NO_LIST_PRICE, WON_CYCLE_REFERENCE, NO_CYCLE_REFERENCE, CLOSED_BASE_RATE)

# Por que não há referência de ciclo (params.cause de NO_CYCLE_REFERENCE)
CAUSE_NO_PRODUCT = "no_product"
CAUSE_NO_AGE = "no_age"
CAUSE_NO_WINS = "no_wins"
CYCLE_CAUSES = (CAUSE_NO_PRODUCT, CAUSE_NO_AGE, CAUSE_NO_WINS)

# Ação sugerida (item.next_action.code e group.next_action.code)
WORK_HIGHEST_LIST_PRICE_FIRST = "work_highest_list_price_first"
CONFIRM_STILL_ACTIVE = "confirm_still_active"
ADVANCE_PROSPECTING = "advance_prospecting"
FIX_MISSING_FIELD = "fix_missing_field"    # no item: cita o campo
FIX_MISSING_FIELDS = "fix_missing_fields"  # no grupo
ACTION_CODES = (WORK_HIGHEST_LIST_PRICE_FIRST, CONFIRM_STILL_ACTIVE, ADVANCE_PROSPECTING,
                FIX_MISSING_FIELD, FIX_MISSING_FIELDS)

# Vazios (group.empty.code e empty.code do payload)
GROUP_EMPTY = "group_empty"
START_WITH_GROUP = "start_with_group"
NO_OPEN_FOR_SELLER = "no_open_for_seller"
NO_OPEN_FOR_FILTER = "no_open_for_filter"
EMPTY_CODES = (GROUP_EMPTY, START_WITH_GROUP, NO_OPEN_FOR_SELLER, NO_OPEN_FOR_FILTER)

# Critérios da ordem dentro do grupo (ordering.within_group), na ordem em que valem.
ORDER_VALUE_BAND = "value_band"
ORDER_SALES_PRICE_DESC = "sales_price_desc"
ORDER_OPPORTUNITY_ID = "opportunity_id"
ORDER_CRITERIA = (ORDER_VALUE_BAND, ORDER_SALES_PRICE_DESC, ORDER_OPPORTUNITY_ID)

# Estratégias do backtest (evidence.rankers[].code), na ordem do relatório.
RANKER_GLOBAL_RATE = "global_rate"
RANKER_PRODUCT_RATE = "product_rate"
RANKER_RANDOM = "random"
RANKER_LIST_PRICE_ONLY = "list_price_only"
RANKER_AGE_NEWEST_FIRST = "age_newest_first"
RANKER_CURRENT_RULE = "current_rule"  # a regra servida: referência das diferenças
RANKER_RULE_A = "rule_a"
RANKER_CODES = (RANKER_GLOBAL_RATE, RANKER_PRODUCT_RATE, RANKER_RANDOM, RANKER_LIST_PRICE_ONLY,
                RANKER_AGE_NEWEST_FIRST, RANKER_CURRENT_RULE, RANKER_RULE_A)
# Só no relatório do backtest, nunca na API: a armadilha usa o desfecho (vazamento).
RANKER_LEAK_QUARTER_END = "leak_quarter_end_close"

# Erros (corpo de erro da API: code)
DATA_FILE_MISSING = "data_file_missing"
DATA_FILE_EMPTY = "data_file_empty"
DATA_FILE_INVALID = "data_file_invalid"
DATA_COLUMNS_MISSING = "data_columns_missing"
DATA_UNKNOWN_LABEL = "data_unknown_label"
DATA_BAD_DATE = "data_bad_date"
DATA_DUPLICATE_KEY = "data_duplicate_key"
DATA_BAD_PRICE = "data_bad_price"
INVALID_AS_OF_FORMAT = "invalid_as_of_format"
AS_OF_BEFORE_LAST_CLOSE = "as_of_before_last_close"
SELLER_NOT_FOUND = "seller_not_found"
OPPORTUNITY_NOT_FOUND = "opportunity_not_found"
EVIDENCE_UNAVAILABLE = "evidence_unavailable"  # resultado do backtest ausente ou inválido
ERROR_CODES = (DATA_FILE_MISSING, DATA_FILE_EMPTY, DATA_FILE_INVALID, DATA_COLUMNS_MISSING, DATA_UNKNOWN_LABEL,
               DATA_BAD_DATE, DATA_DUPLICATE_KEY, DATA_BAD_PRICE, INVALID_AS_OF_FORMAT, AS_OF_BEFORE_LAST_CLOSE,
               SELLER_NOT_FOUND, OPPORTUNITY_NOT_FOUND, EVIDENCE_UNAVAILABLE)
