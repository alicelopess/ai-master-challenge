// Telas: navegação, Carteira e Equipe com respostas sintéticas da API, textos do catálogo e erros de contrato.
import { act, fireEvent, render as renderDom, screen, waitFor, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, test, vi } from "vitest";

import { MainNav } from "@/components/app/main-nav";
import { EvidencePage } from "@/components/evidence/evidence-page";
import { GroupTabs } from "@/components/portfolio/group-tabs";
import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import { RulesPage } from "@/components/rules/rules-page";
import { TeamPage } from "@/components/team/team-page";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/app/page";
import {
  CONTRACT_ERROR, EVIDENCE, GROUP_LABELS, NAV, RANKER_LABELS, ROLE_LABELS, RULES, TEAM, UI, actionText, bandRange,
  bandTitle, errorText, groupDescription, groupEmptyText, pipelineEmptyText, reasonText, tieText,
} from "@/copy/pt-BR";
import type { Evidence, Rules, SellerPipeline, TeamPipeline } from "@/lib/contract";
import { formatPct, formatPp } from "@/lib/format";

import { navigation } from "./navigation";
import { errors, load, sellerPipeline, teamPipeline } from "./fixtures";

// Os mesmos provedores do layout que os componentes usam.
const render = (ui: ReactElement) => renderDom(ui, { wrapper: TooltipProvider });

type Reply = { status: number; body: unknown };
const ok = (body: unknown): Reply => ({ status: 200, body });

/** API simulada: vendedores e meta sempre respondem; `pipeline` responde às carteiras. */
function stubApi(pipeline: (url: string) => Reply) {
  const fetch = vi.fn(async (url: string) => {
    const reply = url.endsWith("/api/sellers") ? ok(load("sellers")) : url.endsWith("/api/meta") ? ok(load("meta")) : pipeline(url);
    return new Response(JSON.stringify(reply.body), { status: reply.status });
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

const bySeller = (url: string): Reply => {
  const name = decodeURIComponent(url.split("/api/sellers/")[1].split("/")[0]);
  return ok(load({ "Ana Alfa": "pipeline-ana-alfa", "Bruno Beta": "pipeline-bruno-beta", "Carla Gama": "pipeline-carla-gama" }[name]!));
};

const tab = (label: string) => screen.findByRole("tab", { name: new RegExp(`^${label}`) });

describe("navegação central", () => {
  test("quatro páginas, com a ativa marcada", () => {
    navigation.go("/equipe");
    render(<MainNav />);
    const links = within(screen.getByRole("navigation")).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(Object.values(NAV));
    expect(screen.getByRole("link", { name: NAV.equipe }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: NAV.carteira }).getAttribute("aria-current")).toBeNull();
  });

  test("a página inicial leva à carteira", () => {
    expect(() => Home()).toThrow("redirect:/carteira");
  });
});

describe("carteira", () => {
  test("escolher o vendedor mostra o próximo passo, as abas e guarda o vendedor na URL", async () => {
    stubApi(bySeller);
    render(<PortfolioPage />);
    const picker = await screen.findByRole("combobox", { name: UI.seller });
    await waitFor(() => expect((picker as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(picker);
    fireEvent.click(await screen.findByRole("option", { name: "Ana Alfa" }));

    expect(navigation.params.get("vendedor")).toBe("Ana Alfa");
    const payload = sellerPipeline("pipeline-ana-alfa");
    expect(await screen.findByText(UI.nextStepTitle)).toBeTruthy();
    expect(screen.getAllByText(actionText(payload.groups[0].next_action!)).length).toBeGreaterThan(0);
    expect((await tab(GROUP_LABELS.focar)).getAttribute("aria-selected")).toBe("true");
    for (const group of payload.groups) expect(await tab(GROUP_LABELS[group.state])).toBeTruthy();
    expect(screen.getByText(groupDescription("focar", payload.meta.cycle_limit_days))).toBeTruthy();
    expect(window.localStorage.getItem("rankio.vendedor")).toBe("Ana Alfa");
  });

  test("o último vendedor volta na próxima visita; Focar vazio abre no grupo indicado", async () => {
    window.localStorage.setItem("rankio.vendedor", "Bruno Beta");
    stubApi(bySeller);
    render(<PortfolioPage />);
    await waitFor(() => expect(navigation.params.get("vendedor")).toBe("Bruno Beta"));
    const focar = sellerPipeline("pipeline-bruno-beta").groups[0];
    expect(focar.empty?.code).toBe("start_with_group");
    expect((await tab(GROUP_LABELS.qualificar)).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText(groupEmptyText(focar.empty!))).toBeTruthy();
  });

  test("a aba fica na URL", async () => {
    navigation.go("/carteira?vendedor=Ana%20Alfa&grupo=revisar");
    stubApi(bySeller);
    render(<PortfolioPage />);
    expect((await tab(GROUP_LABELS.revisar)).getAttribute("aria-selected")).toBe("true");
  });

  test("vendedor sem oportunidades abertas", async () => {
    navigation.go("/carteira?vendedor=Carla%20Gama");
    stubApi(bySeller);
    render(<PortfolioPage />);
    expect(await screen.findByText(pipelineEmptyText(sellerPipeline("pipeline-carla-gama").empty!))).toBeTruthy();
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  test("o cartão mostra o empate inteiro, sem eleger um ID", async () => {
    const payload = structuredClone(load("pipeline-ana-alfa")) as SellerPipeline;
    const focar = payload.groups[0];
    focar.items = [...focar.items.filter((i) => i.tie_size > 1), ...focar.items.filter((i) => i.tie_size === 1)];
    navigation.go("/carteira?vendedor=Ana%20Alfa");
    stubApi(() => ok(payload));
    render(<PortfolioPage />);
    const tie = UI.startWithTie(tieText(2, "GTX Basic", 550));
    const card = (await screen.findByText(tie)).closest("[data-slot=card]") as HTMLElement;
    expect(within(card).getByRole("button", { name: /^E050/ })).toBeTruthy();
    expect(within(card).getByRole("button", { name: /^E138/ })).toBeTruthy();
    expect(within(card).queryByRole("button", { name: /^EPP/ })).toBeNull();
  });

  test("por que está aqui: motivos por papel, próximo passo, Anterior/Próxima e Esc", async () => {
    navigation.go("/carteira?vendedor=Ana%20Alfa");
    stubApi(bySeller);
    render(<PortfolioPage />);
    const [first, second] = sellerPipeline("pipeline-ana-alfa").groups[0].items;
    fireEvent.click(await screen.findByRole("button", { name: UI.whyHereFor(first.opportunity_id) }));

    const sheet = await screen.findByRole("dialog", { name: UI.whyHere });
    for (const role of new Set(first.reasons.map((r) => r.role))) expect(within(sheet).getByText(ROLE_LABELS[role])).toBeTruthy();
    for (const reason of first.reasons) expect(within(sheet).getByText(reasonText(reason))).toBeTruthy();
    expect(within(sheet).getByText(actionText(first.next_action))).toBeTruthy();
    expect(within(sheet).getByText(UI.position(1, 5))).toBeTruthy();

    fireEvent.click(within(sheet).getByRole("button", { name: UI.next }));
    expect(within(sheet).getByText(new RegExp(`^${second.opportunity_id} ·`))).toBeTruthy();
    expect(within(sheet).getByText(UI.position(2, 5))).toBeTruthy();

    fireEvent.keyDown(sheet, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  test("resposta fora do contrato vira mensagem de erro, não tela quebrada", async () => {
    const body = structuredClone(load("pipeline-ana-alfa")) as any;
    body.groups[0].items[0].reasons[0].code = "alta_chance";
    navigation.go("/carteira?vendedor=Ana%20Alfa");
    stubApi(() => ok(body));
    render(<PortfolioPage />);
    expect((await screen.findByRole("alert")).textContent).toBe(CONTRACT_ERROR);
  });

  test("erro da API usa o texto do catálogo para o código", async () => {
    navigation.go("/carteira?vendedor=Ana%20Alfa");
    stubApi(() => ({ status: 404, body: (load("errors") as Record<string, unknown>)["404"] }));
    render(<PortfolioPage />);
    expect((await screen.findByRole("alert")).textContent).toBe(errorText(errors()["404"]));
  });
});

describe("equipe", () => {
  test("números, lista com vendedor e filtros na URL e na chamada", async () => {
    const fetch = stubApi(() => ok(load("team-all")));
    navigation.go("/equipe?gerente=Mara%20Um");
    render(<TeamPage />);
    const payload = teamPipeline("team-all");
    const summary = await screen.findByRole("region", { name: UI.teamSummaryLabel });
    expect(within(summary).getAllByText(UI.ofTotal(payload.summary.total)).length).toBe(4);
    // A coluna Vendedor está na lista de oportunidades e na tabela por vendedor.
    expect(screen.getAllByRole("columnheader", { name: UI.columns.seller })).toHaveLength(2);
    expect(fetch.mock.calls.some(([url]) => String(url).endsWith("/api/pipeline?manager=Mara+Um"))).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: UI.filters.clear }));
    expect(navigation.params.get("gerente")).toBeNull();
    await waitFor(() => expect(fetch.mock.calls.some(([url]) => String(url).endsWith("/api/pipeline"))).toBe(true));
  });

  test("filtro sem oportunidades", async () => {
    stubApi(() => ok(load("team-empty")));
    navigation.go("/equipe?gerente=Ninguem");
    render(<TeamPage />);
    expect(await screen.findByText(pipelineEmptyText(teamPipeline("team-empty").empty!))).toBeTruthy();
  });

  test("a lista cresce aos poucos, na ordem da API", () => {
    const { groups, meta } = sellerPipeline("pipeline-ana-alfa");
    render(<GroupTabs groups={groups} tab="focar" onTab={() => {}} selected={null} onSelect={() => {}}
                      cycleLimitDays={meta.cycle_limit_days} pageSize={2} />);
    const ids = () => screen.getAllByRole("button", { name: /^Por que .* está aqui$/ }).length;
    expect(ids()).toBe(2);
    act(() => fireEvent.click(screen.getByRole("button", { name: UI.showMore(3) })));
    expect(ids()).toBe(4);
    act(() => fireEvent.click(screen.getByRole("button", { name: UI.showMore(1) })));
    expect(ids()).toBe(5);
    expect(screen.queryByRole("button", { name: /^Mostrar mais/ })).toBeNull();
  });
});

describe("equipe por vendedor", () => {
  test("todo vendedor do filtro, na ordem da API, com link para a carteira e sem ordenação", async () => {
    stubApi(() => ok(load("team-all")));
    navigation.go("/equipe");
    render(<TeamPage />);
    const table = (await screen.findByText(TEAM.bySellerTitle)).closest("[data-slot=card]") as HTMLElement;
    const rows = (load("team-all") as TeamPipeline).by_seller;
    const links = within(table).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(rows.map((row) => row.seller));
    expect(links[0].getAttribute("href")).toBe(`/carteira?vendedor=${encodeURIComponent(rows[0].seller)}`);
    expect(within(table).queryAllByRole("button")).toEqual([]);
    expect(screen.getByRole("link", { name: TEAM.seeEvidence }).getAttribute("href")).toBe("/evidencia");
  });

  test("filtro sem vendedores não mostra a tabela", async () => {
    stubApi(() => ok(load("team-empty")));
    navigation.go("/equipe?gerente=Ninguem");
    render(<TeamPage />);
    await screen.findByText(pipelineEmptyText(teamPipeline("team-empty").empty!));
    expect(screen.queryByText(TEAM.bySellerTitle)).toBeNull();
  });
});

describe("evidência", () => {
  test("a pergunta, cada estratégia com rótulo e números do payload, sem a armadilha", async () => {
    stubApi(() => ok(load("evidence")));
    render(<EvidencePage />);
    const evidence = load("evidence") as Evidence;
    const { design } = evidence;
    expect(await screen.findByText(EVIDENCE.question(design.top_k, design.horizon_days))).toBeTruthy();
    const detail = screen.getByText(EVIDENCE.detailTitle).closest("[data-slot=card]") as HTMLElement;
    for (const ranker of evidence.rankers) {
      const row = within(detail).getByText(RANKER_LABELS[ranker.code]).closest("tr") as HTMLElement;
      expect(within(row).getByText(formatPct(ranker.val_at_k))).toBeTruthy();
      if (ranker.delta_val) expect(within(row).getByText(formatPp(ranker.delta_val.value))).toBeTruthy();
    }
    expect(document.body.textContent).not.toMatch(/vazamento|leak/i);
    // A fixture sintética não vem dos CSVs auditados: o aviso aparece.
    expect(design.audited_data).toBe(false);
    expect(screen.getByText(EVIDENCE.notAudited)).toBeTruthy();
  });

  test("sem o resultado do backtest, a mensagem do catálogo", async () => {
    const body = { detail: "x", code: "evidence_unavailable" as const, params: { file: "backtest_results.json" } };
    stubApi(() => ({ status: 503, body }));
    render(<EvidencePage />);
    expect((await screen.findByRole("alert")).textContent).toBe(errorText(body));
  });
});

describe("como funciona", () => {
  test("grupos, faixas e referência de ciclo vindos de /api/rules", async () => {
    stubApi(() => ok(load("rules")));
    render(<RulesPage />);
    const rules = load("rules") as Rules;
    for (const state of rules.ordering.group_order) {
      expect(await screen.findByText(groupDescription(state, rules.meta.cycle_limit_days))).toBeTruthy();
    }
    for (const band of rules.value_bands) {
      const row = screen.getByText(bandTitle(band.band)).closest("tr") as HTMLElement;
      expect(within(row).getByText(bandRange(band))).toBeTruthy();
    }
    for (const product of Object.keys(rules.meta.cycle_references)) expect(screen.getByText(product)).toBeTruthy();
    expect(screen.getByText(RULES.cycleHelp(rules.meta.min_cases))).toBeTruthy();
    expect(screen.getByText(RULES.chance(rules.meta.base_rate))).toBeTruthy();
  });
});
