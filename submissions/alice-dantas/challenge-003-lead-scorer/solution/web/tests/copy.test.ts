// Catálogo de textos: cobre todos os códigos, só cita números recebidos e respeita o vocabulário.
import { describe, expect, test } from "vitest";

import {
  DATA_WARNING, GROUP_LABELS, UI, accountWarning, actionText, bandTitle, clientText, dataLabel, errorText,
  groupEmptyText, legendText, missingShort, pipelineEmptyText, reasonText, summaryCounts, tieText, valueLabel,
} from "@/copy/pt-BR";
import type { Item } from "@/lib/contract";
import { formatDate, formatInt } from "@/lib/format";

import { allPipelines, errors, readContract, sellerPipeline } from "./fixtures";

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
};

const pipelines = allPipelines();
const items = (): Item[] => pipelines.flatMap((p) => p.groups.flatMap((g) => g.items));

/** Todo texto que a tela monta a partir das fixtures. */
function renderedTexts(): string[] {
  const texts: string[] = [...Object.values(GROUP_LABELS), DATA_WARNING];
  for (const value of Object.values(UI)) {
    if (typeof value === "string") texts.push(value);
    else if (typeof value === "object") texts.push(...Object.values(value));
  }
  for (const p of pipelines) {
    texts.push(legendText(p.ordering), dataLabel(p.meta), accountWarning(p.summary.without_account, p.summary.total));
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
});
