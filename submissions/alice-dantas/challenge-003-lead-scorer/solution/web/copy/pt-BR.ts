/**
 * Textos da tela (pt-BR), montados a partir dos códigos do contrato.
 *
 * A API entrega o que a regra decidiu: chaves, códigos e números. Este arquivo
 * decide como dizer, com duas regras: só cita valores recebidos e não afirma mais
 * do que o código diz. `tests/copy.test.ts` confere cobertura dos códigos,
 * vocabulário e a origem de cada número.
 */
import type {
  Delta, ErrorBody, Evidence, EvidenceDesign, Group, Item, Meta, Ordering, RankerResult, SellerPipeline,
  StartWithParams, ValueBandRule,
} from "@/lib/contract";
import { capitalize, formatDate, formatDecimal, formatInt, formatPp } from "@/lib/format";
import type { NavKey } from "@/lib/nav";

export type GroupKey = Item["group"];
export type Reason = Item["reasons"][number];
export type NextAction = Item["next_action"];
export type GroupEmptyState = NonNullable<Group["empty"]>;
export type PipelineEmpty = NonNullable<SellerPipeline["empty"]>;
type MissingField = NonNullable<Item["missing_field"]>;
type ValueBand = NonNullable<Item["value_band"]>;
type ErrorParams = ErrorBody["params"];
export type ReasonRole = Reason["role"];
export type RankerCode = RankerResult["code"];
export type EvidenceVerdict = Evidence["without_no_outcome_verdict"];
/** Os dois limites de idade e o percentil, como o `meta` os entrega. */
export type AgeLimits = Pick<Meta, "won_cycle_limit_days" | "cycle_limit_days" | "cycle_percentile">;

function unreachable(value: never): never {
  throw new Error(`Código sem texto no catálogo: ${JSON.stringify(value)}`);
}

export const BRAND = {
  name: "Rankio",
  wordmark: "rankio",
  tagline: "Saiba onde focar. Venda com mais direção.",
  pill: "Inteligência para priorização de oportunidades comerciais",
} as const;

export const NAV: Record<NavKey, string> = {
  carteira: "Carteira",
  equipe: "Equipe",
  evidencia: "Evidência",
  comoFunciona: "Como funciona",
};

export const PAGES: Record<NavKey, { title: string; description: string }> = {
  carteira: { title: "Minha carteira", description: "Suas oportunidades abertas, na ordem sugerida pela regra." },
  equipe: { title: "Equipe", description: "A carteira aberta da equipe, por gerente e escritório." },
  evidencia: { title: "Evidência", description: "A lista ajuda a escolher onde investir o próximo esforço?" },
  comoFunciona: { title: "Como funciona", description: "Como a lista é montada e o que ela não faz." },
};

export const UI = {
  pageDescription: "Carteira aberta por vendedor, com o motivo de cada posição.",
  navLabel: "Páginas",
  seller: "Vendedor",
  pickSeller: "Escolha seu nome",
  pickSellerHint: "Escolha seu nome para ver suas oportunidades abertas.",
  searchSeller: "Buscar vendedor…",
  noSellerFound: "Nenhum vendedor encontrado.",
  loadingData: "Carregando dados…",
  dataUnavailable: "Dados indisponíveis",
  loading: "Carregando…",
  summaryLabel: "Resumo da carteira",
  teamSummaryLabel: "Carteira da equipe por grupo",
  open: "abertas",
  warning: "Aviso",
  nextStep: "Próximo passo",
  nextStepTitle: "Seu próximo passo",
  startWithOne: "Comece por esta oportunidade:",
  startWithTie: (tie: string) => `Comece por estas ${tie}:`,
  seeGroup: (group: string) => `Ver a aba ${group}`,
  moreInTab: (count: number, group: string) => `+${count} na aba ${group}`,
  groupsLabel: "Grupos da carteira",
  whyHere: "Por que está aqui",
  whyHereFor: (id: string) => `Por que ${id} está aqui`,
  closePanel: "Fechar painel",
  previous: "Anterior",
  next: "Próxima",
  position: (index: number, total: number) => `${index} de ${total}`,
  limitsNote: "O sistema só vê datas, produto e preço de tabela: não vê ligações, reuniões nem e-mails.",
  copyId: "Copiar ID",
  copied: "ID copiado",
  noProduct: "sem produto",
  columns: {
    id: "ID", seller: "Vendedor", product: "Produto", client: "Cliente", price: "Valor de tabela",
    engaged: "Engajada em", age: "Idade",
  },
  columnHelp: {
    price: "Preço de catálogo do produto, não o valor negociado.",
    age: "Dias em negociação, da data de engajamento até a data dos dados.",
  },
  ageDays: (days: number) => `${days} d`,
  empty: "—",
  theme: { label: "Tema", light: "Claro", dark: "Escuro", system: "Sistema" },
  filters: { manager: "Gerente", office: "Escritório", all: "Todos", clear: "Limpar filtros" },
  ofTotal: (total: number) => `de ${formatInt(total)} abertas`,
  pagination: {
    label: "Páginas da tabela",
    previous: "Página anterior",
    next: "Próxima página",
    page: (page: number) => `Página ${page}`,
    range: (from: number, to: number, total: number) =>
      `${formatInt(from)}–${formatInt(to)} de ${formatInt(total)}`,
  },
} as const;

export const TEAM = {
  views: { label: "Análises da equipe", sellers: "Por vendedor", opportunities: "Por oportunidade" },
  noSellers: "Nenhum vendedor neste filtro.",
  bySellerHelp: "A carteira aberta de cada vendedor, em ordem alfabética. A tabela não ordena pessoas por resultado.",
  total: "Abertas",
  withoutAccount: "Sem cliente",
  seeEvidence: "A lista ajuda? Ver a evidência",
} as const;

// Estratégias comparadas no backtest (evidence.rankers[].code).
export const RANKER_LABELS: Record<RankerCode, string> = {
  global_rate: "Taxa de ganho geral",
  product_rate: "Taxa de ganho do produto",
  random: "Ordem aleatória",
  list_price_only: "Só valor de tabela",
  age_newest_first: "Mais recentes primeiro",
  age_max_cycle_only: "Regra anterior (só o maior ciclo)",
  age_p90_then_max_cycle: "Regra atual",
};

export const RANKER_DESCRIPTIONS: Record<RankerCode, string> = {
  global_rate: "A mesma taxa histórica para todas: na prática, não ordena.",
  product_rate: "Maior taxa de ganho histórica do produto primeiro.",
  random: "Sorteio: o resultado do acaso.",
  list_price_only: "Maior valor de tabela primeiro, sem olhar a idade.",
  age_newest_first: "Engajadas há menos tempo primeiro.",
  age_max_cycle_only: "A lista até agora: as abertas até a venda mais longa já fechada primeiro; em cada grupo, maior " +
    "valor de tabela.",
  age_p90_then_max_cycle: "A lista desta ferramenta: primeiro as abertas há até o tempo em que 90% das vendas ganhas " +
    "fecharam, depois as até a venda mais longa já fechada; em cada grupo, maior valor de tabela.",
};

// Evidência em duas linguagens: a de negócio (padrão, para gestores) e a técnica (para quem audita o método).
export type EvidenceLanguage = "negocio" | "tecnica";

export const EVIDENCE_LANGUAGES: Record<EvidenceLanguage, string> = {
  negocio: "Linguagem de negócio",
  tecnica: "Linguagem técnica",
};

export const EVIDENCE = {
  languageLabel: "Linguagem",
  questionLabel: "A pergunta",
  reference: "Referência",
  notAudited: "O backtest não rodou sobre os CSVs auditados: estes números podem não valer para os dados da tela.",
  seeTeam: "Ver a carteira da equipe",
  outOf: (count: number, total: number) => `${count} de ${total}`,
} as const;

export const RANKER_TECH_DESCRIPTIONS: Record<RankerCode, string> = {
  global_rate: "Taxa de ganho global das fechadas até T, igual para todas: empate total, desfeito pelo ID.",
  product_rate: "Taxa de ganho do produto nas fechadas até T, suavizada pela taxa global.",
  random: "Permutação aleatória com semente fixa.",
  list_price_only: "Preço de tabela decrescente; ignora a idade.",
  age_newest_first: "engage_date mais recente primeiro.",
  age_max_cycle_only: "Idade até o maior ciclo fechado até T → faixa → preço de tabela decrescente → ID (a regra até a v4).",
  age_p90_then_max_cycle: "Idade até o piso do P90 do ciclo de todas as ganhas até T → até o maior ciclo fechado até T → " +
    "faixa → preço de tabela decrescente → ID (a regra servida).",
};

/** Pontos percentuais sem sinal, para a linguagem de negócio: −0.031 → "3,1". */
const points = (fraction: number): string => formatDecimal(Math.abs(Math.round(fraction * 1000) / 10), 1);
const pointWord = (fraction: number): string => (Math.abs(fraction) < 0.02 ? "ponto" : "pontos");

function marginText({ low, high }: Delta): string {
  if (high < 0) return `margem de erro: entre ${points(high)} e ${points(low)} pontos a menos`;
  if (low > 0) return `margem de erro: entre ${points(low)} e ${points(high)} pontos a mais`;
  return `margem de erro: entre ${points(low)} a menos e ${points(high)} a mais`;
}

function businessDelta(delta: Delta): string {
  const same = points(delta.value) === points(0);
  if (same && points(delta.low) === points(0) && points(delta.high) === points(0)) return "Igual à regra atual";
  if (same) return `Igual à regra atual (${marginText(delta)})`;
  const side = delta.value < 0 ? "a menos" : "a mais";
  return `${points(delta.value)} ${pointWord(delta.value)} ${side} que a regra atual (${marginText(delta)})`;
}

const quoted = (code: RankerCode | null): string => `"${code ? RANKER_LABELS[code] : ""}"`;

function businessVerdict(verdict: EvidenceVerdict): string {
  const { ranker, delta } = verdict;
  switch (verdict.code) {
    case "reference_behind":
      return `Sem elas, ${quoted(ranker)} rende ${delta ? businessDelta(delta) : ""}. A vantagem da regra atual vem ` +
        "dessas negociações, e elas podem ser um efeito de como a base foi montada.";
    case "reference_ahead":
      return `Mesmo sem elas, a regra atual fica à frente de todas; a mais próxima é ${quoted(ranker)}, com ` +
        `${delta ? businessDelta(delta) : ""}.`;
    case "inconclusive":
      return "Sem elas, a diferença entre a regra atual e as outras fica dentro da margem de erro.";
    default:
      return unreachable(verdict.code);
  }
}

function technicalVerdict(verdict: EvidenceVerdict): string {
  const { ranker, delta } = verdict;
  const cited = delta ? `${quoted(ranker)}: Δ ${formatPp(delta.value)} (IC95%: ${formatPp(delta.low)} a ` +
    `${formatPp(delta.high)})` : "";
  switch (verdict.code) {
    case "reference_behind":
      return `${cited} contra a regra servida. A vantagem da regra servida depende das negociações sem desfecho.`;
    case "reference_ahead":
      return `A regra servida supera todas com o IC95% abaixo de zero; a mais próxima é ${cited}.`;
    case "inconclusive":
      return "Nenhuma diferença contra a regra servida tem o IC95% fora do zero.";
    default:
      return unreachable(verdict.code);
  }
}

type EvidenceText = {
  question: (topK: number, horizonDays: number) => string;
  method: (count: number, first: string, last: string, horizonDays: number) => string;
  headline: (topK: number) => string;
  delta: (delta: Delta) => string;
  chartLabel: string;
  detailTitle: string;
  detailHelp: string;
  columns: { strategy: string; value: (topK: number) => string; delta: (topK: number) => string };
  descriptions: Record<RankerCode, string>;
  withoutTitle: string;
  withoutHelp: string;
  verdict: (verdict: EvidenceVerdict) => string;
  howTitle: string;
  how: (design: EvidenceDesign) => string;
  limitsTitle: string;
  limits: readonly string[];
};

export const EVIDENCE_TEXT: Record<EvidenceLanguage, EvidenceText> = {
  negocio: {
    question: (topK, horizonDays) =>
      `Se cada vendedor trabalhasse as ${topK} primeiras da lista, quanto do valor vendido nos ${horizonDays} dias ` +
      "seguintes estaria nelas?",
    method: (count, first, last, horizonDays) =>
      `Refizemos a lista de cada vendedor em ${count} datas, de ${formatDate(first)} a ${formatDate(last)}, só com o ` +
      `que se sabia em cada dia, e conferimos o que foi vendido nos ${horizonDays} dias seguintes. 100% seria acertar ` +
      "as melhores vendas, como quem já sabe o futuro.",
    headline: (topK) => `do valor vendido estava nas ${topK} primeiras`,
    delta: businessDelta,
    chartLabel: "Valor vendido capturado por jeito de ordenar",
    detailTitle: "Comparação dos jeitos de ordenar",
    detailHelp: "Cada linha é um jeito de montar a lista. Quanto maior a porcentagem, mais a lista apontou para o que " +
      "acabou sendo vendido.",
    columns: {
      strategy: "Como a lista é ordenada",
      value: (topK) => `Valor vendido nas ${topK} primeiras`,
      delta: () => "Comparado à regra atual",
    },
    descriptions: RANKER_DESCRIPTIONS,
    withoutTitle: "E sem as negociações que nunca fecharam na base?",
    withoutHelp: "A mesma conta sem as oportunidades que seguem abertas no fim da base. Mostra se a vantagem da regra " +
      "atual depende delas.",
    verdict: businessVerdict,
    howTitle: "De onde vêm os números",
    how: (design) =>
      `${formatInt(design.unique_opportunities)} oportunidades da base, olhadas em ${design.cuts.length} datas. A ` +
      "margem de erro de cada diferença leva em conta que o mesmo vendedor aparece em todas as datas.",
    limitsTitle: "O que esta evidência não mostra",
    limits: [
      "Não mostra se a equipe seguiu a lista: é uma simulação com dados do passado.",
      "Não garante o mesmo resultado daqui para frente; para medir o efeito de verdade, é preciso testar com parte " +
        "da equipe.",
      "Não avalia as oportunidades em prospecção: elas não têm data para simular o passado.",
      "Usa a base do desafio (um CRM de exemplo); vale repetir com os dados da empresa.",
    ],
  },
  tecnica: {
    question: (topK, horizonDays) =>
      `Val@${topK}: fração do valor ganho em ${horizonDays} dias que as top-${topK} de cada vendedor capturam, sobre ` +
      `o oráculo (as ${topK} melhores sabendo o futuro).`,
    method: (count, first, last, horizonDays) =>
      `Backtest com ${count} cortes mensais, de ${formatDate(first)} a ${formatDate(last)}. População em cada corte ` +
      "T: toda negociação em Engaging aberta em T, inclusive as que nunca fecham. Desfecho: ganhou em até " +
      `${horizonDays} dias após T (observado, pois T + ${horizonDays} dias cai dentro da base). Ordenadores só com ` +
      "atributos conhecidos em T.",
    headline: (topK) => `Val@${topK}`,
    delta: (delta) =>
      `Δ ${formatPp(delta.value)} contra a regra atual (IC95%: ${formatPp(delta.low)} a ${formatPp(delta.high)})`,
    chartLabel: "Val@K por ordenador",
    detailTitle: "Métricas por ordenador",
    detailHelp: "P@K: ganhas nas K ÷ K. Lift@K: ganhas ÷ esperadas ao acaso. Val@K: valor ganho nas K ÷ valor das K " +
      "melhores sabendo o futuro. AUC: 0,5 é o acaso. Δ contra a regra atual com IC95% por bootstrap de vendedores.",
    columns: {
      strategy: "Ordenador",
      value: (topK) => `Val@${topK}`,
      delta: (topK) => `Δ Val@${topK} (IC95%)`,
    },
    descriptions: RANKER_TECH_DESCRIPTIONS,
    withoutTitle: "Sensibilidade: sem as negociações sem desfecho",
    withoutHelp: "Mesmas métricas excluindo as negociações que seguem abertas no fim da base.",
    verdict: technicalVerdict,
    howTitle: "Desenho do backtest",
    how: (design) =>
      `${formatInt(design.observations)} observações (negociação × corte) de ${formatInt(design.unique_opportunities)} ` +
      `negociações únicas; top-${design.top_k} por vendedor com pelo menos ${design.top_k} abertas no corte; IC95% por ` +
      `${formatInt(design.n_boot_sellers)} reamostragens de vendedores, cada um com todos os cortes.`,
    limitsTitle: "Limites do método",
    limits: [
      "Retrospectivo e observacional: mede associação, não o efeito causal de mudar a ordem de trabalho; exige " +
        "piloto com grupo de controle.",
      "Qualificar fica fora: Prospecting não tem engage_date, então não há como reconstruir a carteira em T.",
      "Cortes sobrepostos: as observações não são independentes (tratado com bootstrap por vendedor).",
      "Base provavelmente sintética (ver as limitações no README); não generalizar sem dados reais.",
    ],
  },
};

// Colunas que só a linguagem técnica mostra.
export const TECH_COLUMNS = {
  hits: (topK: number) => `P@${topK}`,
  lift: (topK: number) => `Lift@${topK}`,
  auc: "AUC (mín.–máx. entre cortes)",
  aucCuts: "Cortes com AUC acima do acaso",
  aboveReference: "Cortes acima da referência",
} as const;

export const RULES = {
  groupsTitle: "Os grupos",
  groupsHelp: "Cada oportunidade aberta cai em um grupo. A ordem dos grupos é a ordem da lista.",
  orderTitle: "A ordem dentro do grupo",
  bandsColumns: { band: "Faixa", range: "Valor de tabela" },
  ageTitle: "Os dois limites de idade",
  ageHelp: "Separam as negociações em andamento pelo tempo que as vendas levaram no histórico. Descrevem o " +
    "passado e não dizem quando uma negociação deve terminar: uma mais antiga pode seguir viva.",
  wonLimit: (days: number, percentile: number) =>
    `${percentile}% das vendas ganhas fecharam em até ${days} dias. Até esse tempo, a negociação fica em ` +
    `${GROUP_LABELS.focar}.`,
  longestLimit: (days: number) =>
    `A venda mais longa já fechada levou ${days} dias. Entre os dois limites, a negociação fica em ` +
    `${GROUP_LABELS.acompanhar}; acima, em ${GROUP_LABELS.revisar}.`,
  limitsTitle: "O que a ferramenta não faz",
  limits: [
    "Não calcula chance de fechar por oportunidade.",
    "Não escreve no CRM: só lê os dados e sugere o próximo passo.",
    "Não ordena vendedores: a equipe aparece em ordem alfabética.",
    "Não se atualiza sozinha: a lista vale para a data dos dados.",
  ],
} as const;

/** Faixa de valor de tabela em palavras: "a partir de 3.000", "500 a 2.999", "até 499". */
export function bandRange(rule: ValueBandRule): string {
  if (rule.max_price === null) return `a partir de ${formatInt(rule.min_price)}`;
  if (rule.min_price === 0) return `até ${formatInt(rule.max_price)}`;
  return `${formatInt(rule.min_price)} a ${formatInt(rule.max_price)}`;
}

// Seções do "Por que está aqui", pelo papel que o contrato dá a cada motivo.
export const ROLE_LABELS: Record<ReasonRole, string> = {
  group: "Por que está neste grupo",
  order: "Por que nesta posição",
};

/** Definição de uma linha de cada grupo; os limites vêm do `meta`, como fatos do histórico. */
export function groupDescription(state: GroupKey, limits: AgeLimits): string {
  const { won_cycle_limit_days: won, cycle_limit_days: longest, cycle_percentile: percentile } = limits;
  switch (state) {
    case "focar":
      return `Abertas há até ${won} dias. No histórico, ${percentile}% das vendas ganhas fecharam dentro desse tempo.`;
    case "acompanhar":
      return `Abertas há mais de ${won} e até ${longest} dias: mais do que ${percentile}% das vendas ganhas levaram, ` +
        "sem passar da venda mais longa já fechada.";
    case "revisar":
      return `Abertas há mais de ${longest} dias, mais do que qualquer venda já fechada aqui. O sistema não vê ` +
        "ligações nem reuniões.";
    case "qualificar":
      return "Ainda em prospecção, sem data de início da negociação.";
    case "nao_pontuavel":
      return "Falta produto, preço de tabela ou data de engajamento no CRM.";
    default:
      return unreachable(state);
  }
}

// Verbos no infinitivo: os moldes "Comece por {nome}" e "{nome} porque…" leem bem com todos.
export const GROUP_LABELS: Record<GroupKey, string> = {
  focar: "Focar",
  acompanhar: "Acompanhar",
  revisar: "Confirmar",
  qualificar: "Qualificar",
  nao_pontuavel: "Completar",
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
    case "age_within_won_cycle": {
      const p = reason.params;
      return `${GROUP_LABELS.focar} porque está aberta há ${p.age_days} dias; ${p.percentile}% das vendas ganhas ` +
        `fecharam em até ${p.won_cycle_limit_days} dias.`;
    }
    case "age_above_won_cycle": {
      const p = reason.params;
      return `${GROUP_LABELS.acompanhar} porque está aberta há ${p.age_days} dias: mais do que ${p.percentile}% das ` +
        `vendas ganhas levaram (${p.won_cycle_limit_days} d), sem passar da venda mais longa já fechada ` +
        `(${p.cycle_limit_days} d).`;
    }
    case "age_above_cycle_limit":
      return `${GROUP_LABELS.revisar} porque está aberta há ${reason.params.age_days} dias, mais do que qualquer venda ` +
        `já fechada aqui (${reason.params.cycle_limit_days} d).`;
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
    default:
      return unreachable(reason);
  }
}

const ACTIONS: Record<Exclude<NextAction["code"], "fix_missing_field">, string> = {
  work_highest_list_price_first: "Avance primeiro as de maior valor de tabela; as do mesmo produto valem o mesmo.",
  check_progress: "Veja no CRM o último avanço e o que falta para fechar.",
  confirm_still_active: "Confirme com o cliente ou no CRM se a negociação segue: o tempo aberta não prova que ela " +
    "terminou.",
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
  check_progress: "veja no CRM o último avanço de cada uma",
  confirm_still_active: "confirme no CRM quais seguem ativas",
  advance_prospecting: "avance no CRM as de maior valor de tabela",
  fix_missing_fields: "corrija o cadastro no CRM",
};

export function groupEmptyText(empty: GroupEmptyState): string {
  switch (empty.code) {
    case "group_empty":
      return "Nenhuma oportunidade neste grupo.";
    case "start_with_group": {
      // Focar vazio: cita só o limite que importa para o grupo indicado.
      const p = empty.params;
      const why = p.group === "acompanhar" ? `Nenhuma aberta há até ${p.won_cycle_limit_days} dias.`
        : p.group === "revisar" ? `Todas as negociações em andamento estão abertas há mais de ${p.cycle_limit_days} dias.`
          : "Nenhuma negociação em andamento.";
      return `${why} Comece por ${GROUP_LABELS[p.group]}: ${START_ACTIONS[p.action]}.`;
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
  `${formatInt(withoutAccount)} de ${formatInt(total)} ${NO_ACCOUNT}`;

export const summaryCounts = (payload: Pick<SellerPipeline, "groups" | "summary">): string =>
  payload.groups.map((group) => `${formatInt(payload.summary[group.state])} ${GROUP_LABELS[group.state]}`).join(" + ");

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
  evidence_unavailable: (p) => `Resultado do backtest indisponível ou de outra regra (${text(p.file)}). Rode ` +
    "scripts/backtest.py com os CSVs em data/raw/.",
  no_won_history: (p) => `Nenhuma venda ganha até ${text(p.as_of)}: sem ela não há como separar as negociações pelo ` +
    "tempo das vendas ganhas.",
};

export const errorText = (error: ErrorBody): string => ERRORS[error.code](error.params);

export const networkError = (url: string): string =>
  `Não foi possível acessar a API em ${url}. Confira se a API está rodando: .venv/bin/uvicorn api.main:app --port 8000`;

export const httpError = (status: number): string => `A API respondeu com erro ${status}.`;

export const CONTRACT_ERROR = "A API respondeu num formato que esta tela não reconhece. Atualize a página; se continuar, " +
  "avise quem mantém a ferramenta.";
