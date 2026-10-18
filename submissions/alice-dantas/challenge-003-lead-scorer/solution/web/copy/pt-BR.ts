/**
 * Textos da tela (pt-BR), montados a partir dos códigos do contrato.
 *
 * A API entrega o que a regra decidiu: chaves, códigos e números. Este arquivo
 * decide como dizer, com duas regras: só cita valores recebidos e não afirma mais
 * do que o código diz. `tests/copy.test.ts` confere cobertura dos códigos,
 * vocabulário e a origem de cada número.
 */
import type {
  ChanceTest, Delta, ErrorBody, Evidence, EvidenceDesign, Group, Intelligence, IntelligenceDeals, Item, Meta, Ordering,
  RankerResult, RevenueDrivers, SellerPipeline, SizeBand, StartWithParams, ValueBandRule,
} from "@/lib/contract";
import {
  capitalize, formatCompact, formatDate, formatDecimal, formatInt, formatMonth, formatPct, formatPp, formatWhole,
} from "@/lib/format";
import type { DealOutcome, Dimension, MetricKey } from "@/lib/intelligence";
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
  inteligencia: "Inteligência",
  evidencia: "Evidência",
  comoFunciona: "Como funciona",
};

export const PAGES: Record<NavKey, { title: string; description: string }> = {
  carteira: { title: "Minha carteira", description: "Suas oportunidades abertas, na ordem sugerida pela regra." },
  equipe: { title: "Equipe", description: "A carteira aberta da equipe, por gerente e escritório." },
  inteligencia: {
    title: "Inteligência comercial",
    description: "Onde o processo comercial pode melhorar e o que explica a receita, a partir do histórico.",
  },
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
  dataUnavailable: "Sem conexão com os dados",
  dataRetry: "Não foi possível carregar a data dos dados. Tentar de novo.",
  menu: "Menu",
  loading: "Carregando…",
  summaryLabel: "Resumo da carteira",
  teamSummaryLabel: "Carteira da equipe por grupo",
  open: "abertas",
  portfolioTitle: "Suas oportunidades",
  portfolioCount: "Oportunidades abertas",
  note: "Nota",
  accountNote: "A ausência do cliente é uma lacuna do cadastro e não diz nada sobre a qualidade da oportunidade.",
  emptyGroups: (labels: string[]) => `Sem oportunidades em ${labels.length > 1
    ? `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}` : labels[0]}.`,
  nextStep: "O que verificar agora",
  nextStepTitle: "O que verificar agora",
  startWithOne: "Comece por esta oportunidade:",
  startWithTie: (tie: string) => `Comece por qualquer uma destas ${tie}:`,
  seeGroup: (group: string) => `Ver a aba ${group}`,
  moreInTab: (count: number, group: string) => `+${count} na aba ${group}`,
  groupsLabel: "Grupos da carteira",
  groupGuide: { button: "O que significa cada grupo?", title: "O que cada grupo significa" },
  whyHere: "Por que está aqui",
  whyHereFor: (id: string) => `Por que ${id} está aqui`,
  closePanel: "Fechar painel",
  previous: "Anterior",
  next: "Próxima",
  position: (index: number, total: number) => `Item ${index} de ${total}`,
  limitsNote: "Como o pipeline só apresenta datas, produto e preço de tabela: não apresenta último contato, ligações, " +
    "reuniões nem e-mails, a base não registra atividades, estágio nem contatos; por isso o Rankio indica " +
    "possibilidades para diferentes cenários de negociação, não uma certeza de próximo passo.",
  suggestionsTitle: "Sugestões de negociação",
  suggestionsIntro: "O Rankio não sabe em que contexto a negociação está. Estas são possibilidades para diferentes " +
    "cenários: use as que fizerem sentido.",
  suggestionIf: "Se",
  ageContextTitle: "Idade no contexto do histórico",
  ageContextNote: "Isso descreve as vendas que fecharam; não diz o que acontece com esta negociação.",
  ageContextHelp: "Abrir o contexto histórico da idade",
  copyId: "Copiar ID",
  copied: "ID copiado",
  noProduct: "sem produto",
  columns: {
    id: "ID", seller: "Vendedor", product: "Produto", client: "Cliente", price: "Valor de tabela",
    engaged: "Início da negociação", age: "Idade",
  },
  columnHelp: {
    price: "Preço de catálogo do produto, não o valor negociado.",
    age: "Dias em negociação, da data de engajamento até a data dos dados.",
  },
  ageDays: (days: number) => `${days} d`,
  empty: "—",
  theme: { label: "Tema", light: "Claro", dark: "Escuro", system: "Sistema" },
  filters: { manager: "Gerente", office: "Escritório", all: "Todos", clear: "Limpar filtros" },
  listFilters: {
    searchLabel: "Buscar oportunidades",
    searchPlaceholder: "Buscar por ID, produto ou cliente",
    button: "Filtros",
    title: "Filtros da lista",
    clear: "Limpar busca e filtros",
    account: "Cliente",
    accountWith: "Com cliente registrado",
    accountWithout: "Sem cliente registrado",
    product: "Produto",
    band: "Faixa de valor de tabela",
    age: "Idade (dias)",
    engaged: "Início da negociação",
    from: "De",
    to: "Até",
    ageFrom: "Idade mínima, em dias",
    ageTo: "Idade máxima, em dias",
    engagedFrom: "Início da negociação a partir de",
    engagedTo: "Início da negociação até",
    undated: "Oportunidades sem data de início ou idade ficam de fora quando esses filtros estão ativos.",
    result: (shown: number, total: number) => `${formatInt(shown)} de ${formatInt(total)} oportunidades na lista`,
    noneHere: "Nenhuma oportunidade deste grupo corresponde à busca e aos filtros.",
  },
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
  copyTable: "Copiar tabela",
  tableCopied: "Tabela copiada",
  copyTableHelp: "Copia todos os vendedores do filtro, para colar em planilha ou e-mail.",
} as const;

/** Grupo em zero na equipe: para Focar, o zero fala de tempo de abertura, não da qualidade das oportunidades. */
export function groupZeroNote(state: GroupKey, count: number, limits: AgeLimits): string | null {
  if (count > 0 || state !== "focar") return null;
  return `Nenhuma aberta há até ${limits.won_cycle_limit_days} dias. Isso não quer dizer que a equipe esteja sem boas ` +
    "oportunidades.";
}

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
  random: "Sorteio: sem critério nenhum, só para servir de comparação.",
  list_price_only: "Maior valor de tabela primeiro, sem olhar a idade.",
  age_newest_first: "Iniciadas há menos tempo primeiro.",
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
  if (high < 0) return `a diferença real deve ficar entre ${points(high)} e ${points(low)} pontos a menos`;
  if (low > 0) return `a diferença real deve ficar entre ${points(low)} e ${points(high)} pontos a mais`;
  return `a diferença real deve ficar entre ${points(low)} a menos e ${points(high)} a mais`;
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
      return "Sem elas, a diferença entre a regra atual e as outras é pequena demais para ser confiável.";
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
      "acabou sendo vendido. Na comparação, cada ponto é 1 ponto da porcentagem da coluna ao lado.",
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
      "faixa de cada diferença leva em conta que o mesmo vendedor aparece em todas as datas.",
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
    "Não escreve no CRM: só lê os dados e indica o que verificar.",
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
      return `Abertas há até ${won} dias. No histórico, ${percentile}% das vendas ganhas fecharam dentro desse tempo. ` +
        "É sobre o tempo aberta, não sobre a chance de fechar.";
    case "acompanhar":
      return `Abertas há mais de ${won} e até ${longest} dias: mais do que ${percentile}% das vendas ganhas levaram, ` +
        "sem passar da venda mais longa já fechada.";
    case "revisar":
      return `Para verificar se a negociação continua: abertas há mais de ${longest} dias, mais do que qualquer ` +
        "venda já fechada aqui. Confirmar é limpar a carteira, não prever venda: o sistema não vê ligações nem " +
        "reuniões.";
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

// O que verificar agora: uma verificação no CRM com base nos dados da linha, sem presumir atividade, intenção nem
// compromisso (a base não os registra). Os três primeiros variam com a conta: registrada, ausente ou, no grupo, nenhuma.
const ABOUT_STATUS = "o tempo aberta não prova que ela terminou";
type AccountActionCode = "check_status" | "check_progress" | "confirm_still_active";
const ACCOUNT_ACTIONS: Record<AccountActionCode, { with: (account: string) => string; without: string; group: string }> = {
  check_status: {
    with: (account) => `Consulte no CRM o andamento da negociação com ${account}.`,
    without: "Consulte no CRM o andamento e a conta desta negociação.",
    group: "Consulte no CRM o andamento de cada negociação.",
  },
  check_progress: {
    with: (account) => `Consulte no CRM o último registro da negociação com ${account}.`,
    without: "Consulte no CRM o último registro e a conta desta negociação.",
    group: "Consulte no CRM o último registro de cada negociação.",
  },
  confirm_still_active: {
    with: (account) => `Verifique no CRM se a negociação com ${account} continua: ${ABOUT_STATUS}.`,
    without: `Verifique no CRM se esta negociação continua e qual é a conta: ${ABOUT_STATUS}.`,
    group: `Verifique no CRM se cada negociação continua: ${ABOUT_STATUS}.`,
  },
};

const ACTIONS: Record<"check_prospecting" | "fix_missing_fields", string> = {
  check_prospecting: "Em prospecção, sem data de início: verifique no CRM se já houve engajamento e registre a " +
    "data quando houver.",
  fix_missing_fields: "Corrija no CRM o campo indicado em cada oportunidade.",
};

/** `account` é a conta da oportunidade; sem ela (ou na ação do grupo, que não tem conta) a frase é genérica. */
export function actionText(action: NextAction, account?: string | null): string {
  if (action.code === "fix_missing_field") return `Corrija ${MISSING[action.params.field].name} no CRM.`;
  if (action.code === "check_prospecting" || action.code === "fix_missing_fields") return ACTIONS[action.code];
  const variants = ACCOUNT_ACTIONS[action.code];
  const { has_account: hasAccount } = action.params;
  if (hasAccount === null) return variants.group;
  return hasAccount && account ? variants.with(account) : variants.without;
}

// Ação de "comece por", em minúscula, no meio da frase de Focar vazio.
const START_ACTIONS: Record<StartWithParams["action"], string> = {
  check_progress: "consulte no CRM o último registro de cada uma",
  confirm_still_active: "verifique no CRM quais seguem ativas",
  check_prospecting: "verifique no CRM se já houve engajamento e registre a data",
  fix_missing_fields: "corrija o cadastro no CRM",
};

export function groupEmptyText(empty: GroupEmptyState): string {
  switch (empty.code) {
    case "group_empty":
      return "Nenhuma oportunidade neste grupo.";
    case "start_with_group": {
      // Focar vazio: cita só o limite que importa para o grupo indicado.
      const p = empty.params;
      const why = p.group === "acompanhar" || (p.group === "qualificar" && p.has_engaging)
        ? `Nenhuma aberta há até ${p.won_cycle_limit_days} dias.`
        : p.group === "revisar" ? `Todas as negociações em andamento estão abertas há mais de ${p.cycle_limit_days} dias.`
          : "Nenhuma negociação em andamento.";
      return `${why} Comece por ${GROUP_LABELS[p.group]}: ${START_ACTIONS[p.action]}.`;
    }
    default:
      return unreachable(empty);
  }
}

const PIPELINE_EMPTY: Record<PipelineEmpty["code"], string> = {
  no_open_for_seller: "Nenhuma oportunidade aberta para este vendedor. A base não registra nenhuma aberta no nome dele; " +
    "se isso não era esperado, confira o cadastro no CRM.",
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

type Counted = Pick<SellerPipeline, "groups" | "summary">;

/** Só os grupos com oportunidades; os zerados saem na linha de `emptyGroupsText`, para a ausência não passar
 * por esquecimento. */
export const summaryCounts = (payload: Counted): string =>
  payload.groups.filter((group) => payload.summary[group.state] > 0)
    .map((group) => `${formatInt(payload.summary[group.state])} ${GROUP_LABELS[group.state]}`).join(" + ");

export const emptyGroupsText = (payload: Counted): string | null => {
  const labels = payload.groups.filter((group) => payload.summary[group.state] === 0)
    .map((group) => GROUP_LABELS[group.state]);
  return labels.length ? UI.emptyGroups(labels) : null;
};

export const clientText = (item: Item): string => item.account ?? NO_ACCOUNT;

export const valueLabel = (band: ValueBand): string => `valor de tabela ${band}`;

/** Título de faixa: o total da faixa no grupo; se a página mostra só parte dela, quantas mostra. */
export const bandCountText = (onPage: number, total: number): string =>
  onPage < total ? `${formatInt(onPage)} de ${formatInt(total)} nesta página` : formatInt(total);

export const bandTitle = (band: ValueBand | null): string => (band ? capitalize(valueLabel(band)) : "Sem valor de tabela");

export const missingShort = (field: MissingField): string => MISSING[field].short;

/** Empate: mesmo grupo, produto e valor de tabela. A ordem dentro dele é só pelo código, sem significado. */
export const tieText = (count: number, product: string, price: number): string =>
  `${count} oportunidades empatadas (${product}, ${formatInt(price)})`;

/** No painel de uma oportunidade empatada: a posição na tabela não a põe à frente das outras do bloco. */
export const tieNote = (item: Item): string | null => {
  if (item.tie_size < 2 || item.sales_price === null) return null;
  const others = item.tie_size - 1;
  return `Empata com ${others} ${others === 1 ? "outra" : "outras"} do mesmo produto e valor de tabela; a ordem ` +
    "entre elas é só pelo código.";
};

export type Suggestion = { when: string; then: string };

// Sugestões de negociação: possibilidades para contextos que a base não registra, por grupo. Não são derivadas dos
// dados da oportunidade nem preveem resultado: o Rankio não sabe em qual contexto a negociação está.
const SUGGESTIONS: Record<GroupKey, Suggestion[]> = {
  focar: [
    { when: "já houve contato recente", then: "retome de onde parou e registre o avanço no CRM." },
    { when: "não há registro de contato", then: "consulte no CRM o último registro e avalie um novo contato para " +
      "entender em que ponto a negociação está." },
    { when: "foi enviada uma proposta sem resposta", then: "avalie um novo contato para entender o que falta para a " +
      "decisão." },
    { when: "o cliente pediu mais tempo", then: "combine uma data para retomar e registre no CRM." },
  ],
  qualificar: [
    { when: "já houve conversa com a conta", then: "registre a data de início da negociação no CRM." },
    { when: "ainda não houve contato", then: "avalie um primeiro contato, pelo valor de tabela e pelo que você já " +
      "conhece da conta." },
  ],
  acompanhar: [
    { when: "o último registro é antigo", then: "avalie retomar o contato para entender se a negociação segue." },
    { when: "o cliente respondeu recentemente", then: "registre o avanço no CRM e combine o próximo passo com ele." },
    { when: "o contato mudou de função na empresa", then: "procure quem assumiu o assunto e registre o novo contato." },
    { when: "o cliente indicou que não vai seguir", then: "registre o desfecho no CRM." },
  ],
  revisar: [
    { when: "a negociação continua ativa", then: "registre o avanço e a situação atual no CRM." },
    { when: "o cliente voltou a demonstrar interesse", then: "registre o novo engajamento no CRM." },
    { when: "não há registro recente", then: "confirme com quem atendeu a conta antes de decidir." },
    { when: "o cliente não responde mais", then: "considere registrar o desfecho no CRM e liberar espaço na carteira." },
  ],
  nao_pontuavel: [
    { when: "o dado existe em outra fonte", then: "complete o campo no CRM." },
    { when: "ninguém sabe a informação", then: "pergunte a quem abriu a oportunidade." },
  ],
};

const NO_ACCOUNT_SUGGESTION: Suggestion = {
  when: "a conta não está registrada",
  then: "consulte no CRM quem é a conta antes de contatar.",
};

/** As possibilidades do grupo; a da conta ausente só entra quando a oportunidade não tem conta registrada. */
export const suggestionsFor = (item: Item): Suggestion[] => [
  ...SUGGESTIONS[item.group],
  ...(item.account === null && item.group !== "nao_pontuavel" ? [NO_ACCOUNT_SUGGESTION] : []),
];

export const suggestionText = (suggestion: Suggestion): string => `${UI.suggestionIf} ${suggestion.when}: ${suggestion.then}`;

export type AgeContextMeta = Pick<Meta, "won_cycle_median_days" | "won_cycle_limit_days" | "cycle_limit_days" |
  "cycle_percentile">;

/** O contexto histórico da idade: fatos das vendas ganhas, sem semáforo nem contagem para o limite. */
export const ageContextText = (age: number, meta: AgeContextMeta): string =>
  `Aberta há ${age} dias. Nas vendas ganhas, metade fechou em até ${meta.won_cycle_median_days} dias, ` +
  `${meta.cycle_percentile}% em até ${meta.won_cycle_limit_days} dias e a mais longa levou ${meta.cycle_limit_days}.`;

// Inteligência comercial (ADR-007): descreve o histórico, não prevê. Todo número vem do payload.
export type Diagnostic = Intelligence["diagnostics"][number];
export type Finding = Intelligence["findings"][number];
export type ChanceVerdict = ChanceTest["verdict"];
export type Driver = RevenueDrivers["main"][number];
export type HistoryEmpty = NonNullable<Intelligence["history_empty"]>;
export type DealsEmpty = NonNullable<IntelligenceDeals["empty"]>;

export const DIMENSION_LABELS: Record<Dimension, string> = {
  product: "Produto", seller: "Vendedor", manager: "Gerente", office: "Escritório", sector: "Setor",
  account: "Cliente", size: "Porte do cliente",
};

const DIMENSION_PLURALS: Record<Dimension, string> = {
  product: "produtos", seller: "vendedores", manager: "gerentes", office: "escritórios", sector: "setores",
  account: "clientes", size: "portes de cliente",
};

export const METRIC_LABELS: Record<MetricKey, string> = {
  revenue: "Receita", won: "Vendas ganhas", win_rate: "Taxa de ganho", ticket: "Receita por venda",
  revenue_per_closed: "Receita por fechada", median_won_cycle_days: "Tempo típico até ganhar",
};

/** Valor de uma métrica na unidade dela; "—" quando não há fechadas. */
export function metricText(metric: MetricKey, value: number | null): string {
  if (value === null) return UI.empty;
  switch (metric) {
    case "revenue":
      return formatCompact(value);
    case "won":
      return formatInt(value);
    case "win_rate":
      return formatPct(value);
    case "ticket":
    case "revenue_per_closed":
      return formatWhole(value);
    case "median_won_cycle_days":
      return `${formatInt(value)} d`;
    default:
      return unreachable(metric);
  }
}

export const OUTCOME_LABELS: Record<DealOutcome, string> = { won: "Ganhas", lost: "Sem venda", open: "Abertas" };

const DRIVER_LABELS: Record<Driver, string> = {
  volume: "volume de fechadas", conversion: "taxa de ganho", ticket: "receita por venda (depende dos produtos vendidos)",
};
// O mesmo fator depois de "vem sobretudo".
const DRIVER_FROM: Record<Driver, string> = {
  volume: "do volume de fechadas", conversion: "da taxa de ganho", ticket: "da receita por venda (depende dos produtos vendidos)",
};

/** "a, b e c". */
const listText = (values: string[]): string =>
  values.length <= 1 ? values.join("") : `${values.slice(0, -1).join(", ")} e ${values[values.length - 1]}`;

/** Porte em palavras, com a receita anual do cliente em US$ milhões. */
export function sizeLabel(band: SizeBand, bands: SizeBand[]): string {
  const range = band.key === bands[0]?.key ? `até ${formatInt(Math.round(band.high))} mi`
    : band.key === bands[bands.length - 1]?.key ? `acima de ${formatInt(Math.round(band.low))} mi`
      : `${formatInt(Math.round(band.low))} a ${formatInt(Math.round(band.high))} mi`;
  return `Porte ${band.key} (${range})`;
}

/** Nome de um segmento; a chave nula é a falta do dado. */
export function segmentLabel(dimension: Dimension, key: string | null, bands: SizeBand[]): string {
  if (key === null) return dimension === "product" ? UI.noProduct : NO_ACCOUNT;
  if (dimension === "size") {
    const band = bands.find((b) => b.key === key);
    return band ? sizeLabel(band, bands) : `Porte ${key}`;
  }
  return key;
}

export const INTELLIGENCE = {
  filtersLabel: "Recorte da análise",
  filters: {
    button: "Filtros",
    title: "Filtrar a análise",
    help: "Cada filtro muda todos os números da página e fica no endereço.",
    activeLabel: "Filtros ativos",
    chip: (label: string, value: string) => `${label}: ${value}`,
    remove: (label: string, value: string) => `Tirar o filtro ${label}: ${value}`,
  },
  analyses: {
    button: "Ver análises",
    title: "Análises do recorte",
    help: "Onde o processo pode melhorar e o que os resultados mostram, para o recorte escolhido.",
    tabsLabel: "Tipo de análise",
    process: "Processo",
    findings: "Resultados",
  },
  guide: {
    button: "Como funciona",
    title: "Como funciona a Inteligência",
    help: "O que cada número quer dizer e o que esta página não faz.",
    explore: "Explore: escolha um recorte em \"Ver por\" e filtre por qualquer linha; a página inteira passa a mostrar " +
      "só aquele recorte. O ícone de lista abre as negociações por trás da linha.",
  },
  searchSeller: "Buscar vendedor…",
  searchAccount: "Buscar cliente…",
  noMatch: "Nada encontrado.",
  dataLabel: (meta: Meta) => `Histórico até ${formatDate(meta.as_of)}`,
  historyEmpty: "Nenhuma negociação fechada neste recorte.",
  kpis: {
    label: "Histórico do recorte",
    revenue: "Receita ganha",
    revenueHelp: (revenue: number) => `${formatInt(revenue)}: soma do valor fechado nas vendas ganhas.`,
    won: "Vendas ganhas",
    wonOf: (closed: number) => `de ${formatInt(closed)} fechadas`,
    winRate: "Taxa de ganho",
    winRateRange: (low: number, high: number) => `entre ${formatPct(low)} e ${formatPct(high)}: onde a taxa de ganho real provavelmente está`,
    cycle: "Tempo típico até ganhar",
    days: (days: number) => `${formatInt(days)} dias`,
    lostCycle: (days: number) => `${formatInt(days)} dias nas fechadas sem venda`,
  },
  open: {
    title: "Carteira aberta",
    count: (total: number) => `${formatInt(total)} abertas na data dos dados`,
    listValue: (value: number) => `${formatCompact(value)} em valor de tabela`,
    notRevenue: "Valor de tabela não é receita e não se soma a ela.",
    groupsLabel: "Abertas por grupo",
    excluded: (count: number) => `${formatInt(count)} abertas sem cliente registrado ficam fora deste recorte: elas não ` +
      "têm setor, cliente nem porte.",
  },
  process: {
    title: "Onde o processo pode melhorar",
    help: "Padrões do CRM que a Head de RevOps pode mudar. Cada um traz o número e um próximo passo.",
    none: "Nenhum diagnóstico de processo neste recorte.",
    nextStep: "Próximo passo",
    seeDeals: "Ver negociações",
    seeTeam: "Ver na Equipe",
    seeAccounts: "Ver por cliente",
    seeMonths: "Ver o ritmo mensal",
    crmTitle: "O que o CRM não registra",
    crmHelp: "Sem estes campos, algumas perguntas não têm resposta em nenhuma análise.",
    crmGaps: [
      "Motivo da perda: sem ele, não dá para saber por que as fechadas sem venda não avançaram.",
      "Atividades (ligações, reuniões, e-mails): sem elas, não dá para saber se uma negociação esfriou.",
      "Histórico de estágio: sem ele, não dá para medir quanto tempo cada etapa leva.",
      "Valor proposto nas fechadas sem venda: o CRM grava zero, então não dá para medir o valor que deixou de entrar.",
    ],
  },
  findings: {
    title: "O que os resultados mostram",
    help: "Descobertas calculadas por regras fixas sobre o histórico. Descrevem o que aconteceu; não explicam a causa.",
    none: "Nenhuma descoberta neste recorte.",
    kinds: { descriptive: "Descrição do histórico", statistical: "Comparação entre recortes" },
    seeBy: (dimension: Dimension) => `Ver por ${DIMENSION_LABELS[dimension].toLowerCase()}`,
  },
  explore: {
    title: "Explore os resultados",
    viewBy: "Ver por",
    metric: "Métrica do gráfico",
    peopleNote: "Pessoas aparecem em ordem alfabética e sem gráfico: a tabela não ordena ninguém por resultado.",
    chartNote: "O gráfico mostra as dez primeiras linhas da tabela.",
    columns: {
      closed: "Fechadas", winRate: "Taxa de ganho", ticket: "Receita por venda", revenue: "Receita",
      share: "% da receita", open: "Abertas", sector: "Setor", location: "Sede", size: "Porte",
      products: "Produtos comprados", sellers: "Vendedores", actions: "Ações",
    },
    rateRange: (low: number, high: number) => `${formatPct(low)} a ${formatPct(high)}`,
    productsOf: (bought: number, total: number) => `${bought} de ${total}`,
    filterBy: (name: string) => `Filtrar a página por ${name}`,
    dealsOf: (name: string) => `Ver as negociações de ${name}`,
    empty: "Nenhum segmento neste recorte.",
  },
  matrix: {
    title: "O que cada vendedor vende",
    help: "Fechadas por produto e a fatia de cada produto nas fechadas do vendedor, em ordem alfabética. A cor " +
      "acompanha a fatia.",
    noRate: "A taxa de ganho por vendedor e produto não aparece: com poucas fechadas por combinação, a diferença não " +
      "se repete de um período para o outro.",
    total: "Fechadas",
    cell: (closed: number, share: number | null) => share === null ? formatInt(closed)
      : `${formatInt(closed)} · ${formatPct(share)}`,
    cellLabel: (seller: string, product: string) => `Ver negociações de ${seller} com ${product}`,
  },
  time: {
    title: "Tempo e resultado",
    bandsTitle: "Fechadas por tempo até o desfecho",
    bandsHelp: (meta: Meta) => `Dias entre o engajamento e o fechamento. As duas últimas faixas terminam nos limites ` +
      `da regra: ${meta.won_cycle_limit_days} dias (${meta.cycle_percentile}% das vendas ganhas fecharam até aí) e ` +
      `${meta.cycle_limit_days} dias (a venda mais longa já fechada).`,
    columns: { band: "Ciclo (dias)", won: "Ganhas", lost: "Sem venda", rate: "Taxa de ganho" },
    band: (low: number, high: number) => `${low} a ${high}`,
    monthlyTitle: "Ritmo mensal",
    monthlyHelp: "Novas negociações pela data de engajamento e fechamentos pela data de fechamento.",
    monthColumns: { month: "Mês", engaged: "Novas negociações", won: "Ganhas", lost: "Sem venda" },
    chartLabel: "Novas negociações por mês",
  },
  reading: {
    title: "Como ler esta página",
    definitions: [
      "Receita ganha: soma do valor fechado nas vendas ganhas, pela data de fechamento.",
      "Taxa de ganho: ganhas divididas por fechadas (ganhas e sem venda). Descreve o histórico; não é a chance de uma " +
        "oportunidade fechar.",
      "Entre X e Y, com boa segurança: onde a taxa estaria se o mesmo processo se repetisse.",
      "Pequena demais para ser confiável: com esse número de fechadas, uma diferença desse tamanho apareceria mesmo se todos " +
        "convertessem igual.",
      "Receita por venda: receita dividida pelas vendas ganhas. Ciclo: dias entre o início da negociação e o fechamento.",
      "Carteira aberta: oportunidades em prospecção e em negociação na data dos dados, com os grupos da lista. Valor " +
        "de tabela não é receita.",
    ],
    limitsTitle: "O que esta página não faz",
    limits: [
      "Não prevê nem pontua oportunidades: a lista de trabalho está na Carteira.",
      "Não explica a causa de uma diferença: descreve o histórico.",
      "Não tem filtro de período: os meses do histórico não são comparáveis entre si (ver o diagnóstico do fim do " +
        "trimestre).",
      "A base é provavelmente sintética: alguns padrões podem vir de como ela foi montada.",
    ],
  },
  deals: {
    title: "Negociações",
    scope: (parts: string[]) => (parts.length ? `Recorte: ${parts.join(" · ")}` : "Todo o histórico"),
    filterPart: (label: string, value: string) => `${label} ${value}`,
    groupPart: (group: string) => `grupo ${group}`,
    outcomesLabel: "Desfecho",
    total: (count: number) => `${formatInt(count)} negociações`,
    columns: {
      id: "ID", seller: "Vendedor", product: "Produto", client: "Cliente", value: "Valor fechado",
      price: "Valor de tabela", closed: "Fechada em", engaged: "Início da negociação", cycle: "Ciclo", age: "Idade",
      group: "Grupo",
    },
    valueHelp: "Nas fechadas sem venda, o CRM grava zero: o valor não aparece.",
    seePortfolio: (seller: string) => `Abrir a carteira de ${seller}`,
  },
} as const;

const HISTORY_EMPTY: Record<HistoryEmpty["code"], string> = { no_closed_for_filter: INTELLIGENCE.historyEmpty };
export const historyEmptyText = (empty: HistoryEmpty): string => HISTORY_EMPTY[empty.code];

const DEALS_EMPTY: Record<DealsEmpty["code"], string> = { no_deals_for_filter: "Nenhuma negociação neste recorte." };
export const dealsEmptyText = (empty: DealsEmpty): string => DEALS_EMPTY[empty.code];

/** Diagnóstico do processo: título, o que o número quer dizer e o próximo passo para RevOps. */
export function diagnosticText(diagnostic: Diagnostic): { title: string; body: string; step: string } {
  switch (diagnostic.code) {
    case "engaging_beyond_longest_cycle": {
      const p = diagnostic.params;
      return {
        title: `${formatInt(p.count)} negociações abertas há mais de ${p.cycle_limit_days} dias`,
        body: `${formatInt(p.count)} de ${formatInt(p.engaging)} negociações em andamento` +
          `${p.share === null ? "" : ` (${formatPct(p.share)})`} estão abertas há mais tempo do que qualquer venda já ` +
          `fechada. Na lista, elas ficam em ${GROUP_LABELS[p.group]}. O sistema não vê ligações nem reuniões: o tempo ` +
          "aberta não prova que a negociação terminou.",
        step: "Rotina de confirmação: cada vendedor confirma no CRM quais seguem e registra o desfecho das demais. A " +
          "carteira fica menor e o que sobra é real.",
      };
    }
    case "open_without_account": {
      const p = diagnostic.params;
      const closed = p.closed_without_account === 0 ? `Nas ${formatInt(p.closed)} fechadas, todas têm cliente; por ` +
        "isso a base não permite saber se a ausência do cliente diz algo sobre o desfecho."
        : `Nas fechadas, ${formatInt(p.closed_without_account)} de ${formatInt(p.closed)} não têm.`;
      return {
        title: `${formatInt(p.count)} abertas sem cliente registrado`,
        body: `${formatInt(p.count)} de ${formatInt(p.open)} abertas${p.share === null ? "" : ` (${formatPct(p.share)})`} ` +
          `não têm cliente. ${closed}`,
        step: "Exigir o cliente ao passar a oportunidade para negociação. Sem ele, setor, porte e histórico do cliente " +
          "ficam fora da análise das abertas.",
      };
    }
    case "prospecting_without_engage_date": {
      const p = diagnostic.params;
      return {
        title: `${formatInt(p.count)} em prospecção sem nenhuma data`,
        body: `${formatInt(p.count)} de ${formatInt(p.prospecting)} oportunidades em prospecção não têm data: não dá ` +
          "para saber há quanto tempo estão na carteira nem quantas entram por mês.",
        step: "Registrar a data de criação de cada oportunidade, e não só a de engajamento.",
      };
    }
    case "sellers_without_opportunities": {
      const p = diagnostic.params;
      return {
        title: `${formatInt(p.count)} de ${formatInt(p.team)} vendedores sem nenhuma oportunidade`,
        body: `${listText(p.sellers)} ${p.count === 1 ? "está" : "estão"} no cadastro da equipe, mas sem nenhuma ` +
          "oportunidade no CRM.",
        step: "Confirmar se seguem na equipe e se devem receber carteira.",
      };
    }
    case "quarter_end_outcome_mix": {
      const p = diagnostic.params;
      return {
        title: "Ganhos concentrados no último mês do trimestre",
        body: `No último mês de cada trimestre, ${formatPct(p.quarter_end_win_rate)} das ${formatInt(p.quarter_end_closed)} ` +
          `fechadas são ganhas; nos outros meses, ${formatPct(p.other_win_rate)} das ${formatInt(p.other_closed)}.`,
        step: "Conferir se a data de fechamento registrada é a data real (desfechos registrados em lote?). O padrão só " +
          "aparece depois do desfecho: não serve para prever nem para escolher quando vender.",
      };
    }
    case "engagement_inflow_drop": {
      const p = diagnostic.params;
      const recent = listText(p.recent.map((m) => `${formatInt(m.engaged)} em ${formatMonth(m.month)}`));
      return {
        title: "A entrada de novas negociações caiu",
        body: `${capitalize(recent)}, contra o ritmo de ${formatDecimal(p.base_average, 1)} por mês de ` +
          `${formatMonth(p.base_first_month)} a ${formatMonth(p.base_last_month)}.`,
        step: "Conferir se a geração de pipeline caiu ou se o registro atrasou, e olhar a cobertura do próximo trimestre.",
      };
    }
    case "accounts_shared_by_sellers": {
      const p = diagnostic.params;
      return {
        title: "Clientes atendidos por muitos vendedores",
        body: `Na mediana, cada um dos ${formatInt(p.accounts)} clientes teve fechadas com ${p.median_sellers} ` +
          `vendedores diferentes (até ${p.max_sellers}).`,
        step: "Decidir se haverá dono de conta. Sem ele, o histórico de cada cliente fica espalhado pela equipe.",
      };
    }
    default:
      return unreachable(diagnostic);
  }
}

/** Fatia de um fator da receita: "quase nada" quando o back o marcou como desprezível. */
function driverShare(drivers: RevenueDrivers, driver: Driver): string {
  if (drivers.negligible.includes(driver)) return "quase nada";
  const share = { volume: drivers.volume_share, conversion: drivers.conversion_share, ticket: drivers.ticket_share };
  return formatPct(share[driver]);
}

/** A decomposição da receita de uma dimensão, em palavras. */
export function driversText(dimension: Dimension, drivers: RevenueDrivers): string {
  const plural = DIMENSION_PLURALS[dimension];
  const main = drivers.main.length ? ` A diferença vem sobretudo ${listText(drivers.main.map((d) => DRIVER_FROM[d]))}.`
    : "";
  const spread = `A receita varia ${formatDecimal(drivers.spread_ratio, 1)} vezes entre ${drivers.segments_used} ${plural}. `;
  // Fatia negativa ou acima de 100% (os fatores se compensam): em porcentagem não dá para ler, então não aparece.
  const shares = (["volume", "ticket", "conversion"] as const).filter((d) => !drivers.negligible.includes(d))
    .map((d) => drivers[`${d}_share` as const]);
  if (shares.some((share) => share < 0 || share > 1)) {
    return `${spread}Neste recorte os fatores se compensam, então a diferença não se divide em porcentagens.${main}`;
  }
  const parts = (["volume", "ticket", "conversion"] as const).map((d) => `${DRIVER_LABELS[d]}, ${driverShare(drivers, d)}`);
  return `${spread}Quanto da diferença cada fator explica: ${parts.join("; ")}.${main}`;
}

/** Nota que acompanha a decomposição quando a dimensão é de pessoas. */
export const PEOPLE_DRIVERS_NOTE = "Não mede habilidade: o volume e os produtos vendidos dependem da carteira que cada pessoa recebe.";

/** O veredito da comparação da taxa de ganho entre os segmentos de uma dimensão. */
export function chanceText(dimension: Dimension, chance: ChanceTest): string {
  const plural = DIMENSION_PLURALS[dimension];
  const small = chance.segments_small ? ` ${formatInt(chance.segments_small)} com poucas fechadas ficaram fora da ` +
    "comparação." : "";
  switch (chance.verdict) {
    case "within_chance":
      return `Entre ${formatInt(chance.segments_tested)} ${plural}, a taxa de ganho vai de ` +
        `${formatPct(chance.min_win_rate ?? 0)} a ${formatPct(chance.max_win_rate ?? 0)}: diferença pequena demais para ser ` +
        `confiável com ${formatInt(chance.closed_tested)} fechadas: poderia aparecer mesmo que os recortes fossem ` +
        `iguais.${small}`;
    case "beyond_chance":
      return `Entre ${formatInt(chance.segments_tested)} ${plural}, a taxa de ganho vai de ` +
        `${formatPct(chance.min_win_rate ?? 0)} a ${formatPct(chance.max_win_rate ?? 0)}: diferença grande o bastante para ` +
        `ser confiável com ${formatInt(chance.closed_tested)} fechadas: dificilmente apareceria se os recortes fossem ` +
        `iguais. Descreve este histórico; não prova causa nem que vá se repetir.${small}`;
    case "too_few_closed":
      return `Poucas fechadas por ${DIMENSION_LABELS[dimension].toLowerCase()} para comparar a taxa de ganho.${small}`;
    default:
      return unreachable(chance.verdict);
  }
}

/** Descoberta: título, texto e o tipo (descrição do histórico ou comparação entre recortes). */
export function findingText(finding: Finding): { title: string; body: string; kind: "descriptive" | "statistical" } {
  switch (finding.code) {
    case "win_rate_within_chance": {
      const p = finding.params;
      const dims = listText(p.dimensions.map((d) => DIMENSION_LABELS[d].toLowerCase()));
      return {
        kind: "statistical",
        title: "A taxa de ganho não separa os recortes",
        body: `Por ${dims}, as diferenças de taxa de ganho são pequenas demais para serem confiáveis com ` +
          `${formatInt(p.closed)} fechadas. Nesses recortes, comparar taxas não aponta onde vender melhor.`,
      };
    }
    case "win_rate_beyond_chance": {
      const p = finding.params;
      return {
        kind: "statistical",
        title: `A taxa de ganho por ${DIMENSION_LABELS[p.dimension].toLowerCase()} tem diferenças confiáveis`,
        body: chanceText(p.dimension, p.chance),
      };
    }
    case "revenue_concentrated": {
      const p = finding.params;
      return {
        kind: "descriptive",
        title: `${p.top} de ${p.of} ${DIMENSION_PLURALS[p.dimension]} somam ${formatPct(p.share)} da receita`,
        body: `${listText(p.keys)} ${p.top === 1 ? "responde" : "respondem"} pela maior parte da receita do recorte. ` +
          "Para interpretar, compare volume, receita por venda e taxa de ganho no Explore.",
      };
    }
    case "revenue_gap_drivers": {
      const p = finding.params;
      const people = ["seller", "manager", "office"].includes(p.dimension) ? ` ${PEOPLE_DRIVERS_NOTE}` : "";
      return {
        kind: "statistical",
        title: `O que explica a diferença de receita entre ${DIMENSION_PLURALS[p.dimension]}`,
        body: `${driversText(p.dimension, p.drivers)}${people}`,
      };
    }
    case "fast_losses": {
      const p = finding.params;
      return {
        kind: "descriptive",
        title: "As fechadas sem venda se decidem cedo",
        body: `Metade das ${formatInt(p.lost)} fechadas sem venda fechou em até ${p.median_lost_cycle_days} dias; nas ` +
          `${formatInt(p.won)} ganhas, a mediana é de ${p.median_won_cycle_days} dias.`,
      };
    }
    case "account_product_coverage": {
      const p = finding.params;
      const counts = listText(p.distribution.map((d) => `${formatInt(d.accounts)} compraram ${d.bought}`));
      const missing = p.most_missing ? ` O que mais falta é o ${p.most_missing}, em ${formatInt(p.most_missing_accounts)} ` +
        "clientes." : "";
      return {
        kind: "descriptive",
        title: "Os clientes já compram quase todo o catálogo",
        body: `Dos ${formatInt(p.accounts)} clientes com venda ganha, ${counts} dos ${p.products} produtos.${missing} Não ` +
          "há lacuna de produto visível para venda cruzada, e isso não diz se um cliente compraria de novo.",
      };
    }
    default:
      return unreachable(finding);
  }
}

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
  data_bad_number: (p) => `${text(p.table)}.csv: ${text(p.column)} precisa ser um número não negativo ` +
    `(${text(p.ids)}).`,
  invalid_parameter: (p) => `Parâmetro ${text(p.name)} inválido: '${text(p.value)}'.`,
};

export const errorText = (error: ErrorBody): string => ERRORS[error.code](error.params);

export const networkError = (url: string): string =>
  `Não foi possível acessar a API em ${url}. Confira se a API está rodando: .venv/bin/uvicorn api.main:app --port 8000`;

export const httpError = (status: number): string => `A API respondeu com erro ${status}.`;

export const CONTRACT_ERROR = "A API respondeu num formato que esta tela não reconhece. Atualize a página; se continuar, " +
  "avise quem mantém a ferramenta.";
