"""Códigos do contrato: o que a regra decidiu, como dado (plano do contrato, fase F2).

O núcleo entrega chaves, códigos e números; o texto de cada código é de quem
apresenta (a tela e a CLI). Um código novo precisa entrar aqui, no schema da API
(`api/schemas.py`) e nos catálogos de texto, ou os testes de contrato falham.
"""
from __future__ import annotations

CONTRACT_VERSION = 5  # 2: códigos ao lado dos textos (F2); 3: sem os campos de texto (F5);
                      # 4: /api/evidence, /api/rules e o resumo por vendedor na carteira da equipe;
                      # 5: regra A (ADR-006): grupo acompanhar, dois limites, só motivos que decidem

# Papel de cada motivo: o que ele decidiu na posição da oportunidade. Só entra motivo que decide.
ROLE_GROUP = "group"      # decidiu o grupo
ROLE_ORDER = "order"      # decidiu a ordem dentro do grupo
ROLES = (ROLE_GROUP, ROLE_ORDER)

# Motivos (item.reasons[].code)
AGE_WITHIN_WON_CYCLE = "age_within_won_cycle"    # focar: idade até L1
AGE_ABOVE_WON_CYCLE = "age_above_won_cycle"      # acompanhar: acima de L1, até L2
AGE_ABOVE_CYCLE_LIMIT = "age_above_cycle_limit"  # revisar: acima de L2
PROSPECTING_STAGE = "prospecting_stage"
MISSING_FIELD = "missing_field"
LIST_PRICE = "list_price"
NO_PRODUCT = "no_product"
NO_LIST_PRICE = "no_list_price"
REASON_CODES = (AGE_WITHIN_WON_CYCLE, AGE_ABOVE_WON_CYCLE, AGE_ABOVE_CYCLE_LIMIT, PROSPECTING_STAGE, MISSING_FIELD,
                LIST_PRICE, NO_PRODUCT, NO_LIST_PRICE)

# Ação sugerida (item.next_action.code e group.next_action.code)
WORK_HIGHEST_LIST_PRICE_FIRST = "work_highest_list_price_first"
CHECK_PROGRESS = "check_progress"
CONFIRM_STILL_ACTIVE = "confirm_still_active"
ADVANCE_PROSPECTING = "advance_prospecting"
FIX_MISSING_FIELD = "fix_missing_field"    # no item: cita o campo
FIX_MISSING_FIELDS = "fix_missing_fields"  # no grupo
ACTION_CODES = (WORK_HIGHEST_LIST_PRICE_FIRST, CHECK_PROGRESS, CONFIRM_STILL_ACTIVE, ADVANCE_PROSPECTING,
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

# Estratégias do backtest (evidence.rankers[].code), na ordem do relatório. O código descreve a
# regra, não o papel: qual delas é servida diz `SERVED_RANKER` (e `evidence.reference`).
RANKER_GLOBAL_RATE = "global_rate"
RANKER_PRODUCT_RATE = "product_rate"
RANKER_RANDOM = "random"
RANKER_LIST_PRICE_ONLY = "list_price_only"
RANKER_AGE_NEWEST_FIRST = "age_newest_first"
RANKER_AGE_MAX_CYCLE_ONLY = "age_max_cycle_only"          # só o maior ciclo → preço (regra até a v4)
RANKER_AGE_P90_THEN_MAX_CYCLE = "age_p90_then_max_cycle"  # regra A: P90 das ganhas → maior ciclo → preço
RANKER_CODES = (RANKER_GLOBAL_RATE, RANKER_PRODUCT_RATE, RANKER_RANDOM, RANKER_LIST_PRICE_ONLY,
                RANKER_AGE_NEWEST_FIRST, RANKER_AGE_MAX_CYCLE_ONLY, RANKER_AGE_P90_THEN_MAX_CYCLE)
SERVED_RANKER = RANKER_AGE_P90_THEN_MAX_CYCLE  # a regra que triage.py serve: referência das diferenças
# Só no relatório do backtest, nunca na API: a armadilha usa o desfecho (vazamento).
RANKER_LEAK_QUARTER_END = "leak_quarter_end_close"

# O que acontece com a regra servida sem as negociações que nunca fecham (evidence.without_no_outcome_verdict).
VERDICT_REFERENCE_BEHIND = "reference_behind"  # alguma alternativa fica à frente, com IC acima de zero
VERDICT_INCONCLUSIVE = "inconclusive"
VERDICT_REFERENCE_AHEAD = "reference_ahead"    # todas ficam atrás, com IC abaixo de zero
VERDICT_CODES = (VERDICT_REFERENCE_BEHIND, VERDICT_INCONCLUSIVE, VERDICT_REFERENCE_AHEAD)

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
EVIDENCE_UNAVAILABLE = "evidence_unavailable"  # resultado do backtest ausente, inválido ou de outra regra
NO_WON_HISTORY = "no_won_history"  # nenhuma venda ganha até o as_of: não há o primeiro limite de idade
ERROR_CODES = (DATA_FILE_MISSING, DATA_FILE_EMPTY, DATA_FILE_INVALID, DATA_COLUMNS_MISSING, DATA_UNKNOWN_LABEL,
               DATA_BAD_DATE, DATA_DUPLICATE_KEY, DATA_BAD_PRICE, INVALID_AS_OF_FORMAT, AS_OF_BEFORE_LAST_CLOSE,
               SELLER_NOT_FOUND, OPPORTUNITY_NOT_FOUND, EVIDENCE_UNAVAILABLE, NO_WON_HISTORY)
