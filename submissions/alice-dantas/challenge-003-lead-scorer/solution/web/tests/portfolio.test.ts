// Leitura da ordem da API: por onde começar e o primeiro bloco, sem regra nova no front.
import { describe, expect, test } from "vitest";

import { defaultTab, firstBlock, startGroup } from "@/lib/portfolio";

import { sellerPipeline, teamPipeline } from "./fixtures";

describe("por onde começar", () => {
  test("Focar com itens: começa por Focar", () => {
    expect(startGroup(sellerPipeline("pipeline-ana-alfa"))?.state).toBe("focar");
  });
  test("Focar vazio: o grupo indicado pelo back em start_with_group", () => {
    const payload = sellerPipeline("pipeline-bruno-beta");
    expect(payload.groups[0].empty?.code).toBe("start_with_group");
    expect(startGroup(payload)?.state).toBe("qualificar");
    expect(defaultTab(payload)).toBe("qualificar");
  });
  test("sem abertas: nenhum grupo; a aba inicial é a primeira da ordem", () => {
    const payload = sellerPipeline("pipeline-carla-gama");
    expect(startGroup(payload)).toBeNull();
    expect(defaultTab(payload)).toBe("focar");
    expect(startGroup(teamPipeline("team-empty"))).toBeNull();
  });
});

describe("primeiro bloco", () => {
  test("item sem empate: só ele", () => {
    expect(firstBlock(sellerPipeline("pipeline-ana-alfa").groups[0]).map((i) => i.opportunity_id)).toEqual(["EPP"]);
  });
  test("empate no topo: o bloco inteiro", () => {
    const focar = sellerPipeline("pipeline-ana-alfa").groups[0];
    const tied = { ...focar, items: focar.items.filter((i) => i.tie_size > 1) };
    expect(firstBlock(tied).map((i) => i.opportunity_id)).toEqual(["E050", "E138"]);
  });
  test("sem preço de tabela não há empate", () => {
    const naoPontuavel = sellerPipeline("pipeline-edges-bruno-beta").groups[3];
    const noPrice = { ...naoPontuavel, items: naoPontuavel.items.filter((i) => i.sales_price === null) };
    expect(firstBlock(noPrice)).toHaveLength(1);
  });
});
