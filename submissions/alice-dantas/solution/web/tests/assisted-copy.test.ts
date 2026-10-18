// Textos da priorização assistida: cobertura, vocabulário e a regra de nunca parecer previsão de fechamento.
import { describe, expect, test } from "vitest";

import { CATEGORY_ACTIONS, CATEGORY_LABELS, CONFLICT_TEXTS, QUESTIONS, ANSWER_LABELS, ANSWER_SHORT } from "@/copy/assisted";
import { DIMENSIONS, OPTIONS } from "@/lib/assisted/model";

import { assistedTexts, evaluations } from "./assisted-texts";

describe("cobertura", () => {
  test("toda pergunta, resposta e categoria tem texto", () => {
    expect(Object.keys(QUESTIONS).sort()).toEqual([...DIMENSIONS].sort());
    for (const dimension of DIMENSIONS) {
      expect(Object.keys(ANSWER_LABELS[dimension]).sort(), dimension).toEqual([...OPTIONS[dimension]].sort());
      expect(Object.keys(ANSWER_SHORT[dimension]).sort(), dimension).toEqual([...OPTIONS[dimension]].sort());
    }
    expect(Object.keys(CATEGORY_ACTIONS).sort()).toEqual(Object.keys(CATEGORY_LABELS).sort());
    expect(Object.keys(CONFLICT_TEXTS)).toHaveLength(2);
  });
  test("as amostras percorrem todas as categorias de trabalho", () => {
    const seen = new Set(evaluations().map((e) => e.category).filter(Boolean));
    expect([...seen].sort()).toEqual(Object.keys(CATEGORY_LABELS).sort());
  });
});

describe("a ferramenta nunca parece prever o fechamento", () => {
  const texts = assistedTexts();
  test("há textos para varrer", () => {
    expect(texts.length).toBeGreaterThan(80);
  });
  test("nenhuma porcentagem, probabilidade, chance nem \"melhor oportunidade\"", () => {
    for (const text of texts) {
      expect(text, text).not.toMatch(/%|probabilidade|chance|melhor oportunidade|garant/i);
    }
  });
  test("o aviso de que não é previsão de fechamento acompanha o resultado", () => {
    expect(texts.some((t) => /não é previsão de fechamento/.test(t))).toBe(true);
  });
  test("nenhum texto sai com valor faltando", () => {
    for (const text of texts) expect(text).not.toMatch(/undefined|null|NaN|\[object/);
  });
});
