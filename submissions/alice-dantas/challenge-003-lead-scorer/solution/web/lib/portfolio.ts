// Leitura da ordem que veio da API, sem regra nova: por onde começar e o primeiro bloco da lista.
import type { Group, Item, SellerPipeline, TeamPipeline } from "@/lib/contract";

type Pipeline = Pick<SellerPipeline | TeamPipeline, "groups" | "empty">;

/** O grupo por onde começar: o primeiro da ordem ou, se ele vier vazio, o que o back indicou em `start_with_group`. */
export function startGroup(pipeline: Pipeline): Group | null {
  if (pipeline.empty) return null;
  const first = pipeline.groups[0];
  if (!first) return null;
  if (first.items.length) return first;
  if (first.empty?.code !== "start_with_group") return null;
  const target = first.empty.params.group;
  return pipeline.groups.find((group) => group.state === target) ?? null;
}

/** O primeiro bloco da lista: o empate inteiro (mesmo produto e valor de tabela). Dentro dele a ordem
 * por ID é só estabilidade, então nenhum item é destacado sozinho. */
export function firstBlock(group: Group): Item[] {
  const first = group.items[0];
  if (!first) return [];
  return group.items.slice(0, first.sales_price !== null ? first.tie_size : 1);
}

/** Aba inicial: o grupo por onde começar; sem ele, o primeiro da ordem. */
export const defaultTab = (pipeline: Pipeline): Group["state"] | undefined =>
  startGroup(pipeline)?.state ?? pipeline.groups[0]?.state;
