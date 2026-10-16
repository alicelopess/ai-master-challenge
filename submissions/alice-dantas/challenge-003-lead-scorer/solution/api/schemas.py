"""Contrato tipado das respostas da API (plano do contrato, fases F1, F2 e F5).

Espelha o payload de `views`. Os modelos proíbem campos extras: um campo novo em
`views` sem par aqui quebra a resposta e os testes, em vez de passar sem contrato.

O back entrega chaves, códigos e números (`leadscorer/codes.py`); quem apresenta
(tela e CLI) escreve o texto. O payload não leva texto pronto para a tela.
"""
from __future__ import annotations

from datetime import date
from typing import Annotated, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field

from leadscorer import codes, policy

# Literal com uma tupla equivale a listar os valores: as constantes do núcleo continuam a fonte.
StateKey = Literal[policy.STATES]
OpenStage = Literal[policy.OPEN_STAGES]
ValueBand = Literal[tuple(label for label, _ in policy.VALUE_BANDS)]
MissingField = Literal[tuple(policy.MISSING_FIELDS)]
OrderCriterion = Literal[codes.ORDER_CRITERIA]
ErrorCode = Literal[codes.ERROR_CODES]

class Contract(BaseModel):
    model_config = ConfigDict(extra="forbid")


class NoParams(Contract):
    """Código sem parâmetros."""


# Motivos: o que decidiu o grupo (role "group"), a ordem ("order") ou só contexto ("context").
class AgeParams(Contract):
    age_days: int = Field(description="Dias corridos desde engage_date até o as_of.")
    cycle_limit_days: int = Field(description="Maior ciclo entre as fechadas até o as_of.")


class AgeWithinCycleLimit(Contract):
    """Engaging com idade até o maior ciclo fechado: grupo focar."""
    code: Literal[codes.AGE_WITHIN_CYCLE_LIMIT]
    role: Literal[codes.ROLE_GROUP]
    params: AgeParams


class AgeAboveCycleLimit(Contract):
    """Engaging com idade acima do maior ciclo fechado: grupo revisar."""
    code: Literal[codes.AGE_ABOVE_CYCLE_LIMIT]
    role: Literal[codes.ROLE_GROUP]
    params: AgeParams


class ProspectingParams(Contract):
    deal_stage: Literal["Prospecting"]


class ProspectingStage(Contract):
    """Estágio Prospecting: grupo qualificar (a regra é o estágio, não a falta de data)."""
    code: Literal[codes.PROSPECTING_STAGE]
    role: Literal[codes.ROLE_GROUP]
    params: ProspectingParams


class FieldParams(Contract):
    field: MissingField


class MissingFieldReason(Contract):
    """Falta um campo necessário: grupo nao_pontuavel."""
    code: Literal[codes.MISSING_FIELD]
    role: Literal[codes.ROLE_GROUP]
    params: FieldParams


class ListPriceParams(Contract):
    product: str
    sales_price: int = Field(description="Preço de tabela (catálogo, não valor negociado).")
    value_band: ValueBand


class ListPrice(Contract):
    """Faixa e preço de tabela: ordenam dentro do grupo."""
    code: Literal[codes.LIST_PRICE]
    role: Literal[codes.ROLE_ORDER]
    params: ListPriceParams


class NoProduct(Contract):
    """Sem produto, não há preço para ordenar."""
    code: Literal[codes.NO_PRODUCT]
    role: Literal[codes.ROLE_ORDER]
    params: NoParams


class ProductParams(Contract):
    product: str


class NoListPrice(Contract):
    """O produto não tem preço no catálogo."""
    code: Literal[codes.NO_LIST_PRICE]
    role: Literal[codes.ROLE_ORDER]
    params: ProductParams


class WonCycleParams(Contract):
    product: str
    percentile: int
    p90_days: int = Field(description="Ciclo até o qual fecharam `percentile`% das ganhas do produto.")
    won_n: int = Field(description="Vendas ganhas do produto até o as_of.")
    few_cases: bool = Field(description="won_n abaixo do mínimo de casos: ler como indicação.")
    age_days: int
    cycle_limit_days: int


class WonCycleReference(Contract):
    """Referência de ciclo das ganhas do produto: só contexto."""
    code: Literal[codes.WON_CYCLE_REFERENCE]
    role: Literal[codes.ROLE_CONTEXT]
    params: WonCycleParams


class NoCycleParams(Contract):
    cause: Literal[codes.CYCLE_CAUSES]
    product: Optional[str] = None
    as_of: Optional[date] = None


class NoCycleReference(Contract):
    """Não há referência de ciclo (sem produto, sem idade ou sem ganhas até o as_of)."""
    code: Literal[codes.NO_CYCLE_REFERENCE]
    role: Literal[codes.ROLE_CONTEXT]
    params: NoCycleParams


class BaseRate(Contract):
    won: int
    closed: int
    open: int
    pct: int = Field(description="Ganhas sobre fechadas, em %.")
    low_pct: int = Field(description="Se todas as abertas fossem perdidas, em %.")
    high_pct: int = Field(description="Se todas as abertas fossem ganhas, em %.")


class ClosedBaseRate(Contract):
    """Taxa de ganho das fechadas: igual para todas as oportunidades, só contexto."""
    code: Literal[codes.CLOSED_BASE_RATE]
    role: Literal[codes.ROLE_CONTEXT]
    params: BaseRate


Reason = Annotated[Union[AgeWithinCycleLimit, AgeAboveCycleLimit, ProspectingStage, MissingFieldReason, ListPrice,
                         NoProduct, NoListPrice, WonCycleReference, NoCycleReference, ClosedBaseRate],
                   Field(discriminator="code")]


# Ação sugerida pela regra.
class SimpleAction(Contract):
    code: Literal[codes.WORK_HIGHEST_LIST_PRICE_FIRST, codes.CONFIRM_STILL_ACTIVE, codes.ADVANCE_PROSPECTING,
                  codes.FIX_MISSING_FIELDS]
    params: NoParams


class FixFieldAction(Contract):
    code: Literal[codes.FIX_MISSING_FIELD]
    params: FieldParams


NextAction = Annotated[Union[SimpleAction, FixFieldAction], Field(discriminator="code")]


# Vazios.
class GroupEmpty(Contract):
    code: Literal[codes.GROUP_EMPTY]
    params: NoParams


class StartWithParams(Contract):
    group: StateKey = Field(description="Primeiro grupo seguinte que tem oportunidades.")
    action: Literal[codes.CONFIRM_STILL_ACTIVE, codes.ADVANCE_PROSPECTING, codes.FIX_MISSING_FIELDS]
    cycle_limit_days: int


class StartWithGroup(Contract):
    """O grupo focar está vazio: comece pelo grupo indicado."""
    code: Literal[codes.START_WITH_GROUP]
    params: StartWithParams


GroupEmptyState = Annotated[Union[GroupEmpty, StartWithGroup], Field(discriminator="code")]


class PipelineEmpty(Contract):
    code: Literal[codes.NO_OPEN_FOR_SELLER, codes.NO_OPEN_FOR_FILTER]
    params: NoParams


class Ordering(Contract):
    """A ordem da lista como dado, para quem apresenta explicar a ordem."""
    group_order: List[StateKey]
    within_group: List[OrderCriterion] = Field(description="Critérios dentro do grupo, na ordem em que valem.")
    age_affects_order: bool


class Item(Contract):
    opportunity_id: str
    sales_agent: str
    product: Optional[str]
    account: Optional[str] = Field(description="Nulo quando a oportunidade não tem conta registrada.")
    sales_price: Optional[int] = Field(description="Preço de tabela do produto (catálogo, não valor negociado).")
    value_band: Optional[ValueBand]
    engage_date: Optional[date]
    age_days: Optional[int] = Field(description="Dias corridos de engage_date até o as_of.")
    group: StateKey
    deal_stage: OpenStage
    missing_field: Optional[MissingField]
    tie_size: int = Field(description="Quantas oportunidades do mesmo grupo e produto (mesmo preço) há na carteira.")
    reasons: List[Reason] = Field(description="Um motivo de grupo, um de ordem e os de contexto, nesta ordem.")
    next_action: NextAction


class Group(Contract):
    state: StateKey
    count: int
    empty: Optional[GroupEmptyState] = Field(description="Nulo quando o grupo tem oportunidades.")
    next_action: Optional[NextAction] = Field(description="Nulo quando o grupo está vazio.")
    items: List[Item] = Field(description="Na ordem de prioridade decidida pelo núcleo.")


class Summary(Contract):
    total: int
    focar: int
    revisar: int
    qualificar: int
    nao_pontuavel: int
    without_account: int = Field(description="Oportunidades sem conta registrada.")


class CycleReference(Contract):
    p90_days: Optional[int]
    won_n: int


class Meta(Contract):
    as_of: date
    cycle_limit_days: int
    cycle_percentile: int
    min_cases: int
    cycle_references: Dict[str, CycleReference]
    base_rate: BaseRate
    audited: bool = Field(description="Os CSVs são a versão auditada (hash).")
    contract_version: Literal[codes.CONTRACT_VERSION]


class SellerPipeline(Contract):
    seller: str
    meta: Meta
    ordering: Ordering
    summary: Summary
    empty: Optional[PipelineEmpty] = Field(description="Nulo quando há oportunidades abertas.")
    groups: List[Group] = Field(description="Na ordem de `ordering.group_order`.")


class TeamFilter(Contract):
    manager: Optional[str]
    office: Optional[str]


class TeamPipeline(Contract):
    filter: TeamFilter
    meta: Meta
    ordering: Ordering
    summary: Summary
    empty: Optional[PipelineEmpty] = Field(description="Nulo quando há oportunidades abertas.")
    groups: List[Group] = Field(description="Na ordem de `ordering.group_order`.")


class Seller(Contract):
    name: str
    manager: str
    office: str


class SellerList(Contract):
    sellers: List[Seller] = Field(description="Em ordem alfabética, sem métricas.")


class ErrorBody(Contract):
    detail: str = Field(description="Mensagem do núcleo, a mesma da CLI.")
    code: ErrorCode
    params: Dict[str, Union[int, str, List[str]]] = Field(description="Valores citados pelo erro, por código.")
