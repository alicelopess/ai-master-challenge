// Catálogo de textos: cobre todos os códigos, só cita números recebidos e respeita o vocabulário.
import { describe, expect, test } from "vitest";

import {
  BRAND, DATA_WARNING, EVIDENCE, EVIDENCE_LANGUAGES, EVIDENCE_TEXT, GROUP_LABELS, NAV, PAGES, RANKER_DESCRIPTIONS,
  RANKER_LABELS, RANKER_TECH_DESCRIPTIONS, ROLE_LABELS, RULES, TECH_COLUMNS, TEAM,
  UI, accountWarning, actionText, bandRange, bandTitle, clientText, dataLabel, errorText, groupDescription,
  groupEmptyText, legendText, missingShort, pipelineEmptyText, reasonText, summaryCounts, tieText, valueLabel,
} from "@/copy/pt-BR";
import type { Evidence, Rules } from "@/lib/contract";
import type { Item } from "@/lib/contract";
import { formatDate, formatInt, formatPct, formatPp } from "@/lib/format";

import { allPipelines, errors, load, readContract, sellerPipeline } from "./fixtures";

// Mesma lista do núcleo (leadscorer/policy.py, FORBIDDEN_TERMS).
const FORBIDDEN_TERMS = ["probabilidade", "perdida", "encerre", "prioridade alta", "chance alta", "score"];
const BAND_WORD = /\b(alt[oa]|médi[oa]|baix[oa])\b/gi;
const NUMBER = /\d{2}\/\d{2}\/\d{4}|\d{1,3}(?:\.\d{3})+|\d+/g;

const schemas = readContract().components.schemas;
const codeOf = (name: string): string[] => {
  const code = schemas[name].properties.code;
  return code.enum ?? [code.const];
};
const refName = (ref: { $ref: string }) => ref.$ref.split("/").pop() as string;

const CONTRACT = {
  reasons: schemas.Item.properties.reasons.items.oneOf.flatMap((r: { $ref: string }) => codeOf(refName(r))),
  actions: [...codeOf("SimpleAction"), ...codeOf("FixFieldAction")],
  empty: [...codeOf("GroupEmpty"), ...codeOf("StartWithGroup"), ...codeOf("PipelineEmpty")],
  errors: schemas.ErrorBody.properties.code.enum as string[],
  groups: schemas.Group.properties.state.enum as string[],
  rankers: schemas.RankerResult.properties.code.enum as string[],
};

const pipelines = allPipelines();
const items = (): Item[] => pipelines.flatMap((p) => p.groups.flatMap((g) => g.items));

/** Todos os textos fixos de um catálogo (objetos aninhados inclusive). */
const strings = (value: unknown): string[] =>
  typeof value === "string" ? [value] : value && typeof value === "object" ? Object.values(value).flatMap(strings) : [];

/** Todo texto que a tela monta a partir das fixtures. */
function renderedTexts(): string[] {
  const texts: string[] = [...strings([GROUP_LABELS, BRAND, NAV, PAGES, ROLE_LABELS, UI, TEAM, RANKER_LABELS,
    RANKER_DESCRIPTIONS, RANKER_TECH_DESCRIPTIONS, EVIDENCE, EVIDENCE_LANGUAGES, EVIDENCE_TEXT, TECH_COLUMNS, RULES]),
    DATA_WARNING];
  const evidence = load("evidence") as Evidence;
  const rules = load("rules") as Rules;
  const { design } = evidence;
  for (const text of Object.values(EVIDENCE_TEXT)) {
    texts.push(text.question(design.top_k, design.horizon_days), text.headline(design.top_k),
      text.columns.value(design.top_k), text.columns.delta(design.top_k), text.how(design),
      text.method(design.cuts.length, design.cuts[0], design.cuts[design.cuts.length - 1], design.horizon_days),
      ...[...evidence.rankers, ...evidence.without_no_outcome].flatMap((r) => (r.delta_val ? [text.delta(r.delta_val)] : [])));
  }
  texts.push(TECH_COLUMNS.hits(design.top_k), TECH_COLUMNS.lift(design.top_k), EVIDENCE.outOf(6, 7),
    RULES.cycleHelp(rules.meta.min_cases), RULES.cycleColumns.cycle(rules.meta.cycle_percentile),
    RULES.chance(rules.meta.base_rate), RULES.days(105), ...rules.value_bands.map(bandRange),
    ...rules.value_bands.map((b) => bandTitle(b.band)));
  texts.push(UI.seeGroup(GROUP_LABELS.revisar), UI.moreInTab(3, GROUP_LABELS.focar), UI.whyHereFor("EPP"),
    UI.position(1, 5), UI.ageDays(10), UI.ofTotal(2089), UI.pagination.page(2), UI.pagination.range(26, 50, 1291),
    UI.startWithTie(tieText(3, "GTX Plus Pro", 5482)));
  for (const p of pipelines) {
    texts.push(legendText(p.ordering), dataLabel(p.meta), accountWarning(p.summary.without_account, p.summary.total));
    texts.push(...p.groups.map((g) => groupDescription(g.state, p.meta.cycle_limit_days)));
    if (p.empty) texts.push(pipelineEmptyText(p.empty));
    for (const g of p.groups) {
      if (g.empty) texts.push(groupEmptyText(g.empty));
      if (g.next_action) texts.push(actionText(g.next_action));
    }
  }
  for (const item of items()) {
    texts.push(...item.reasons.map(reasonText), actionText(item.next_action), clientText(item), bandTitle(item.value_band));
    if (item.missing_field) texts.push(missingShort(item.missing_field));
    if (item.product && item.sales_price !== null) texts.push(tieText(item.tie_size, item.product, item.sales_price));
  }
  texts.push(...Object.values(errors()).map(errorText));
  return texts;
}

describe("cobertura: todo código do contrato tem texto", () => {
  const seen = {
    reasons: new Set(items().flatMap((i) => i.reasons.map((r) => r.code))),
    actions: new Set([...items().map((i) => i.next_action.code),
      ...pipelines.flatMap((p) => p.groups.flatMap((g) => (g.next_action ? [g.next_action.code] : [])))]),
    empty: new Set(pipelines.flatMap((p) => [
      ...(p.empty ? [p.empty.code] : []), ...p.groups.flatMap((g) => (g.empty ? [g.empty.code] : []))])),
  };

  test.each(["reasons", "actions", "empty"] as const)("%s: as fixtures exercitam todos os códigos", (kind) => {
    expect([...seen[kind]].sort()).toEqual([...CONTRACT[kind]].sort());
  });
  test("grupos", () => {
    expect(Object.keys(GROUP_LABELS).sort()).toEqual([...CONTRACT.groups].sort());
  });
  test("estratégias do backtest: rótulo e descrição para cada código", () => {
    expect(Object.keys(RANKER_LABELS).sort()).toEqual([...CONTRACT.rankers].sort());
    expect(Object.keys(RANKER_DESCRIPTIONS).sort()).toEqual([...CONTRACT.rankers].sort());
    expect(Object.keys(RANKER_TECH_DESCRIPTIONS).sort()).toEqual([...CONTRACT.rankers].sort());
    expect((load("evidence") as Evidence).rankers.map((r) => r.code).sort()).toEqual([...CONTRACT.rankers].sort());
  });
  test.each(CONTRACT.errors)("erro %s", (code) => {
    expect(errorText({ detail: "", code: code as never, params: {} })).not.toBe("");
  });
  test("nenhum texto sai com valor faltando", () => {
    for (const text of renderedTexts()) expect(text).not.toMatch(/undefined|null|NaN|\[object/);
  });
});

test("vocabulário: nenhum termo proibido; faixa sempre como valor de tabela", () => {
  for (const text of renderedTexts()) {
    const lowered = text.toLowerCase();
    for (const term of FORBIDDEN_TERMS) expect(lowered, text).not.toContain(term);
    for (const match of text.matchAll(BAND_WORD)) {
      expect(lowered.slice(0, match.index).endsWith("de tabela "), text).toBe(true);
    }
  }
});

test("todo número de um motivo vem dos parâmetros do código", () => {
  for (const item of items()) {
    for (const reason of item.reasons) {
      let text = reasonText(reason);
      const allowed = new Set<string>();
      for (const value of Object.values(reason.params as Record<string, unknown>)) {
        if (typeof value === "number") allowed.add(String(value)).add(formatInt(value));
        if (typeof value === "string") {
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) allowed.add(formatDate(value));
          else text = text.replaceAll(value, " "); // números dentro de um nome (ex.: "GTK 500")
        }
      }
      for (const number of text.match(NUMBER) ?? []) expect(allowed, `${number} em "${text}"`).toContain(number);
    }
  }
});

// Textos de referência: a redação é desta camada; mudar uma frase é uma decisão
// explícita, que aparece aqui. Valores das fixtures sintéticas.
function itemOf(fixture: string, id: string): Item {
  const item = sellerPipeline(fixture).groups.flatMap((g) => g.items).find((i) => i.opportunity_id === id);
  if (!item) throw new Error(`${id} não está em ${fixture}`);
  return item;
}

describe("textos de referência", () => {
  test("motivos e próximo passo de Focar e Revisar", () => {
    const epp = itemOf("pipeline-ana-alfa", "EPP");
    expect(epp.reasons.map(reasonText)).toEqual([
      "Focar porque está em negociação há 10 dias, dentro do maior ciclo já fechado (138 d).",
      "Valor de tabela 5.482 (valor de tabela alto): preço de catálogo do GTX Plus Pro, não valor negociado.",
      "Sem vendas ganhas deste produto até 31/12/2017: não há ciclo de referência para comparar.",
      "Não sabemos a chance de fechar desta oportunidade: cerca de 67% das fechadas foram ganhas " +
        "(20% a 90% contando as abertas).",
    ]);
    expect(actionText(epp.next_action)).toBe(
      "Trabalhe primeiro os de maior valor de tabela; empates do mesmo produto valem o mesmo.");
    expect(reasonText(itemOf("pipeline-ana-alfa", "EGP").reasons[2])).toBe(
      "Referência do GTX Pro: em 90% das vendas ganhas, o ciclo foi de até 59 dias (N = 1). Esta está há 30 " +
        "dias; o maior ciclo já fechado foi de 138 dias. Poucos casos; leia como indicação.");
    const e139 = itemOf("pipeline-ana-alfa", "E139");
    expect(reasonText(e139.reasons[0])).toBe(
      "Revisar porque está em negociação há 139 dias, acima do maior ciclo já fechado (138 d).");
    expect(actionText(e139.next_action)).toBe(
      "Confirme no CRM se segue ativa: idade acima do ciclo não prova que o negócio terminou.");
  });

  test("Qualificar e Não pontuável", () => {
    const p1 = itemOf("pipeline-edges-bruno-beta", "P1");
    expect([reasonText(p1.reasons[0]), reasonText(p1.reasons[2])]).toEqual([
      "Qualificar porque ainda está em prospecção.", "Sem data de engajamento: não há idade para comparar."]);
    const n1 = itemOf("pipeline-edges-bruno-beta", "N1");
    expect([reasonText(n1.reasons[0]), actionText(n1.next_action), missingShort(n1.missing_field!)]).toEqual([
      "Não pontuável porque falta a data de engajamento.", "Corrija a data de engajamento no CRM.",
      "sem data de engajamento"]);
    const n2 = itemOf("pipeline-edges-bruno-beta", "N2");
    expect([reasonText(n2.reasons[1]), reasonText(n2.reasons[2])]).toEqual([
      "Sem valor de tabela: a oportunidade não tem produto.", "Sem produto: não há ciclo de referência para comparar."]);
    expect(reasonText(itemOf("pipeline-edges-bruno-beta", "U1").reasons[1])).toBe(
      "Sem valor de tabela: o GTX Ultra não tem preço no catálogo.");
  });

  test("carteira, grupos vazios e avisos", () => {
    const ana = sellerPipeline("pipeline-ana-alfa");
    expect(legendText(ana.ordering)).toBe("Ordem: Focar → Revisar → Qualificar → Não pontuável; em cada grupo, " +
      "maior valor de tabela primeiro; a idade aparece, mas não muda a ordem.");
    expect(dataLabel(ana.meta)).toBe("Dados até 31/12/2017");
    expect(accountWarning(ana.summary.without_account, ana.summary.total)).toBe("4 de 6 sem cliente registrado");
    expect(summaryCounts(ana)).toBe("5 Focar + 1 Revisar + 0 Qualificar + 0 Não pontuável");
    expect(groupEmptyText(sellerPipeline("pipeline-bruno-beta").groups[0].empty!)).toBe(
      "Nenhuma oportunidade dentro do ciclo observado (até 138 d). Comece por Qualificar: avance no CRM as de " +
        "maior valor de tabela.");
    expect(pipelineEmptyText(sellerPipeline("pipeline-carla-gama").empty!)).toBe(
      "Nenhuma oportunidade aberta para este vendedor.");
    expect(clientText(itemOf("pipeline-ana-alfa", "E138"))).toBe("sem cliente registrado");
    expect(valueLabel("médio")).toBe("valor de tabela médio");
  });

  test("definição dos grupos, papéis dos motivos e cartão de próximo passo", () => {
    const limit = sellerPipeline("pipeline-ana-alfa").meta.cycle_limit_days;
    expect((["focar", "revisar", "qualificar", "nao_pontuavel"] as const).map((g) => groupDescription(g, limit))).toEqual([
      "Em negociação há até 138 dias, dentro do maior ciclo já fechado.",
      "Em negociação há mais de 138 dias, acima do maior ciclo já fechado.",
      "Ainda em prospecção.",
      "Falta produto, preço de tabela ou data de engajamento no CRM.",
    ]);
    expect(ROLE_LABELS).toEqual({
      group: "Por que está neste grupo", order: "Por que nesta posição", context: "Para contexto (não muda a posição)",
    });
    expect(UI.startWithTie(tieText(3, "GTX Plus Pro", 5482))).toBe(
      "Comece por estas 3 oportunidades de mesmo valor de tabela (GTX Plus Pro, 5.482):");
    expect([UI.ofTotal(2089), UI.pagination.range(26, 50, 1291)]).toEqual(["de 2.089 abertas", "26–50 de 1.291"]);
  });

  test("evidência e regras: frações em porcentagem, diferenças em pontos e faixas em palavras", () => {
    expect([formatPct(0.569), formatPct(0.14), formatPct(1)]).toEqual(["56,9%", "14,0%", "100,0%"]);
    expect([formatPp(-0.031), formatPp(0.015), formatPp(0), formatPp(-0.0004)]).toEqual(
      ["−3,1 pp", "+1,5 pp", "0,0 pp", "0,0 pp"]);
    const bands = (load("rules") as Rules).value_bands;
    expect(bands.map((b) => `${bandTitle(b.band)}: ${bandRange(b)}`)).toEqual([
      "Valor de tabela alto: a partir de 3.000", "Valor de tabela médio: 500 a 2.999", "Valor de tabela baixo: até 499"]);
  });

  test("evidência em linguagem de negócio: pontos em palavras, sem jargão", () => {
    const { negocio, tecnica } = EVIDENCE_TEXT;
    expect(negocio.question(10, 90)).toBe(
      "Se cada vendedor trabalhasse as 10 primeiras da lista, quanto do valor vendido nos 90 dias seguintes estaria nelas?");
    expect(negocio.delta({ value: -0.031, low: -0.044, high: -0.019 })).toBe(
      "3,1 pontos a menos que a regra atual (margem de erro: entre 1,9 e 4,4 pontos a menos)");
    expect(negocio.delta({ value: 0.015, low: 0.002, high: 0.027 })).toBe(
      "1,5 ponto a mais que a regra atual (margem de erro: entre 0,2 e 2,7 pontos a mais)");
    expect(negocio.delta({ value: 0.004, low: -0.008, high: 0.016 })).toBe(
      "0,4 ponto a mais que a regra atual (margem de erro: entre 0,8 a menos e 1,6 a mais)");
    expect(negocio.delta({ value: 0, low: 0, high: 0 })).toBe("Igual à regra atual");
    expect(tecnica.delta({ value: -0.031, low: -0.044, high: -0.019 })).toBe(
      "Δ −3,1 pp contra a regra atual (IC95%: −4,4 pp a −1,9 pp)");
    // A linguagem de negócio não usa siglas nem jargão estatístico.
    const business = [...strings(negocio), ...Object.values(RANKER_DESCRIPTIONS), negocio.question(10, 90),
      negocio.headline(10), negocio.columns.value(10), negocio.columns.delta(10)];
    for (const line of business) expect(line, line).not.toMatch(/\bpp\b|IC95%|AUC|Val@|P@|Lift|bootstrap|oráculo/i);
  });
});
