/**
 * Textos da tela (pt-BR), montados a partir dos códigos do contrato.
 *
 * A API entrega o que a regra decidiu: chaves, códigos e números. Este arquivo
 * decide como dizer, com duas regras: só cita valores recebidos e não afirma mais
 * do que o código diz. `tests/copy.test.ts` confere cobertura dos códigos,
 * vocabulário e a origem de cada número.
 */
import type { ErrorBody, Group, Item, Meta, Ordering, SellerPipeline, StartWithParams } from "@/lib/contract";
import { capitalize, formatDate, formatInt } from "@/lib/format";

export type GroupKey = Item["group"];
export type Reason = Item["reasons"][number];
export type NextAction = Item["next_action"];
export type GroupEmptyState = NonNullable<Group["empty"]>;
export type PipelineEmpty = NonNullable<SellerPipeline["empty"]>;
type MissingField = NonNullable<Item["missing_field"]>;
type ValueBand = NonNullable<Item["value_band"]>;
type ErrorParams = ErrorBody["params"];

function unreachable(value: never): never {
  throw new Error(`Código sem texto no catálogo: ${JSON.stringify(value)}`);
}

export const UI = {
  title: "Onde focar",
  pageTitle: "Onde focar · Carteira aberta",
  pageDescription: "Carteira aberta por vendedor, com o motivo de cada posição.",
  seller: "Vendedor",
  pickSeller: "Escolha seu nome",
  pickSellerHint: "Escolha seu nome para ver suas oportunidades abertas.",
  loadingData: "Carregando dados…",
  dataUnavailable: "Dados indisponíveis",
  loading: "Carregando…",
  summaryLabel: "Resumo da carteira",
  open: "abertas",
  warning: "Aviso",
  nextStep: "Próximo passo",
  whyHere: "Por que está aqui",
  whyHereFor: (id: string) => `Por que ${id} está aqui`,
  closePanel: "Fechar painel",
  noProduct: "sem produto",
  columns: { id: "ID", product: "Produto", client: "Cliente", price: "Valor de tabela", engaged: "Engajada em", age: "Idade" },
  ageDays: (days: number) => `${days} d`,
  empty: "—",
} as const;

export const GROUP_LABELS: Record<GroupKey, string> = {
  focar: "Focar",
  revisar: "Revisar",
  qualificar: "Qualificar",
  nao_pontuavel: "Não pontuável",
};

// Campo ausente: motivo curto (na linha) e o nome usado nas frases.
const MISSING: Record<MissingField, { short: string; name: string }> = {
  product: { short: "sem produto", name: "o produto" },
  sales_price: { short: "sem preço de tabela", name: "o preço de tabela" },
  engage_date: { short: "sem data de engajamento", name: "a data de engajamento" },
};

export const NO_ACCOUNT = "sem cliente registrado";

export function reasonText(reason: Reason): string {
  switch (reason.code) {
    case "age_within_cycle_limit":
      return `${GROUP_LABELS.focar} porque está em negociação há ${reason.params.age_days} dias, dentro do maior ` +
        `ciclo já fechado (${reason.params.cycle_limit_days} d).`;
    case "age_above_cycle_limit":
      return `${GROUP_LABELS.revisar} porque está em negociação há ${reason.params.age_days} dias, acima do maior ` +
        `ciclo já fechado (${reason.params.cycle_limit_days} d).`;
    case "prospecting_stage":
      return `${GROUP_LABELS.qualificar} porque ainda está em prospecção.`;
    case "missing_field":
      return `${GROUP_LABELS.nao_pontuavel} porque falta ${MISSING[reason.params.field].name}.`;
    case "list_price": {
      const { product, sales_price, value_band } = reason.params;
      return `Valor de tabela ${formatInt(sales_price)} (${valueLabel(value_band)}): preço de catálogo do ${product}, ` +
        "não valor negociado.";
    }
    case "no_product":
      return "Sem valor de tabela: a oportunidade não tem produto.";
    case "no_list_price":
      return `Sem valor de tabela: o ${reason.params.product} não tem preço no catálogo.`;
    case "won_cycle_reference": {
      const p = reason.params;
      const text = `Referência do ${p.product}: em ${p.percentile}% das vendas ganhas, o ciclo foi de até ` +
        `${p.p90_days} dias (N = ${formatInt(p.won_n)}). Esta está há ${p.age_days} dias; o maior ciclo já ` +
        `fechado foi de ${p.cycle_limit_days} dias.`;
      return p.few_cases ? `${text} Poucos casos; leia como indicação.` : text;
    }
    case "no_cycle_reference": {
      const p = reason.params;
      switch (p.cause) {
        case "no_product":
          return "Sem produto: não há ciclo de referência para comparar.";
        case "no_age":
          return "Sem data de engajamento: não há idade para comparar.";
        case "no_wins":
          return `Sem vendas ganhas deste produto até ${p.as_of ? formatDate(p.as_of) : "a data de referência"}: ` +
            "não há ciclo de referência para comparar.";
        default:
          return unreachable(p.cause);
      }
    }
    case "closed_base_rate": {
      const p = reason.params;
      return `Não sabemos a chance de fechar desta oportunidade: cerca de ${p.pct}% das fechadas foram ganhas ` +
        `(${p.low_pct}% a ${p.high_pct}% contando as abertas).`;
    }
    default:
      return unreachable(reason);
  }
}

const ACTIONS: Record<Exclude<NextAction["code"], "fix_missing_field">, string> = {
  work_highest_list_price_first: "Trabalhe primeiro os de maior valor de tabela; empates do mesmo produto valem o mesmo.",
  confirm_still_active: "Confirme no CRM se segue ativa: idade acima do ciclo não prova que o negócio terminou.",
  advance_prospecting: "Ainda em prospecção: avance no CRM os de maior valor de tabela e registre a data de " +
    "engajamento quando houver contato.",
  fix_missing_fields: "Corrija no CRM o campo indicado em cada oportunidade.",
};

export function actionText(action: NextAction): string {
  if (action.code === "fix_missing_field") return `Corrija ${MISSING[action.params.field].name} no CRM.`;
  return ACTIONS[action.code];
}

// Ação de "comece por", em minúscula, no meio da frase de Focar vazio.
const START_ACTIONS: Record<StartWithParams["action"], string> = {
  confirm_still_active: "confirme no CRM quais seguem ativas",
  advance_prospecting: "avance no CRM as de maior valor de tabela",
  fix_missing_fields: "corrija o cadastro no CRM",
};

export function groupEmptyText(empty: GroupEmptyState): string {
  switch (empty.code) {
    case "group_empty":
      return "Nenhuma oportunidade neste grupo.";
    case "start_with_group": {
      const p = empty.params;
      return `Nenhuma oportunidade dentro do ciclo observado (até ${p.cycle_limit_days} d). ` +
        `Comece por ${GROUP_LABELS[p.group]}: ${START_ACTIONS[p.action]}.`;
    }
    default:
      return unreachable(empty);
  }
}

const PIPELINE_EMPTY: Record<PipelineEmpty["code"], string> = {
  no_open_for_seller: "Nenhuma oportunidade aberta para este vendedor.",
  no_open_for_filter: "Nenhuma oportunidade aberta para este filtro.",
};

export const pipelineEmptyText = (empty: PipelineEmpty): string => PIPELINE_EMPTY[empty.code];

// A legenda só descreve a ordem que conhece; uma ordem nova cai na versão curta.
const KNOWN_WITHIN_GROUP = "value_band,sales_price_desc,opportunity_id";

export function legendText(ordering: Ordering): string {
  const groups = ordering.group_order.map((key) => GROUP_LABELS[key]).join(" → ");
  if (ordering.within_group.join(",") !== KNOWN_WITHIN_GROUP) return `Ordem: ${groups}.`;
  const age = ordering.age_affects_order ? "" : "; a idade aparece, mas não muda a ordem";
  return `Ordem: ${groups}; em cada grupo, maior valor de tabela primeiro${age}.`;
}

export const dataLabel = (meta: Meta): string => `Dados até ${formatDate(meta.as_of)}`;

export const DATA_WARNING =
  "Atenção: dados diferentes da versão auditada; os números conferidos no PRD deixam de ser garantidos.";

export const accountWarning = (withoutAccount: number, total: number): string =>
  `${withoutAccount} de ${total} ${NO_ACCOUNT}`;

export const summaryCounts = (payload: Pick<SellerPipeline, "groups" | "summary">): string =>
  payload.groups.map((group) => `${payload.summary[group.state]} ${GROUP_LABELS[group.state]}`).join(" + ");

export const clientText = (item: Item): string => item.account ?? NO_ACCOUNT;

export const valueLabel = (band: ValueBand): string => `valor de tabela ${band}`;

export const bandTitle = (band: ValueBand | null): string => (band ? capitalize(valueLabel(band)) : "Sem valor de tabela");

export const missingShort = (field: MissingField): string => MISSING[field].short;

export const tieText = (count: number, product: string, price: number): string =>
  `${count} oportunidades de mesmo valor de tabela (${product}, ${formatInt(price)})`;

// Erros: os valores vêm de `params`; o `detail` da API é para quem opera.
const text = (value: ErrorParams[string] | undefined): string =>
  Array.isArray(value) ? value.join(", ") : value === undefined ? "" : String(value);

const ERRORS: Record<ErrorBody["code"], (p: ErrorParams) => string> = {
  data_file_missing: (p) => `Arquivo ausente: ${text(p.files)}. Copie os CSVs para ${text(p.folder)}/ ` +
    "(passo a passo em data/raw/README.md).",
  data_file_empty: (p) => `${text(p.table)}.csv está vazio.`,
  data_file_invalid: (p) => `${text(p.table)}.csv não é um CSV válido.`,
  data_columns_missing: (p) => `${text(p.table)}.csv sem as colunas: ${text(p.columns)}.`,
  data_unknown_label: (p) => `Valor sem cadastro em ${text(p.table)}.csv (${text(p.column)}): ${text(p.labels)}.`,
  data_bad_date: (p) => `${text(p.table)}.csv: ${text(p.column)} fora do formato AAAA-MM-DD.`,
  data_duplicate_key: (p) => `${text(p.table)}.csv tem ${text(p.column)} repetido: ${text(p.values)}.`,
  data_bad_price: () => "products.csv: sales_price precisa ser um número inteiro.",
  invalid_as_of_format: (p) => `Data inválida: '${text(p.value)}'. Use o formato AAAA-MM-DD, a partir de ` +
    `${text(p.minimum)}.`,
  as_of_before_last_close: (p) => `Data ${text(p.value)} anterior ao último fechamento registrado. Use uma data a ` +
    `partir de ${text(p.minimum)}.`,
  seller_not_found: (p) => `Vendedor '${text(p.seller)}' não encontrado.`,
  opportunity_not_found: (p) => `Oportunidade ${text(p.opportunity_id)} não encontrada.`,
  evidence_unavailable: (p) => `Resultado do backtest indisponível (${text(p.file)}). Rode scripts/backtest.py ` +
    "com os CSVs em data/raw/.",
};

export const errorText = (error: ErrorBody): string => ERRORS[error.code](error.params);

export const networkError = (url: string): string =>
  `Não foi possível acessar a API em ${url}. Confira se a API está rodando: .venv/bin/uvicorn api.main:app --port 8000`;

export const httpError = (status: number): string => `A API respondeu com erro ${status}.`;

export const CONTRACT_ERROR = "A API respondeu num formato que esta tela não reconhece. Atualize a página; se continuar, " +
  "avise quem mantém a ferramenta.";
