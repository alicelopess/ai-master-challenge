// Tela: renderiza as fixtures com os textos do catálogo e mostra erro quando a resposta foge do contrato.
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Portfolio } from "@/app/components/Portfolio";
import Page from "@/app/page";
import {
  CONTRACT_ERROR, GROUP_LABELS, UI, actionText, errorText, groupEmptyText, pipelineEmptyText, reasonText,
} from "@/copy/pt-BR";
import type { SellerPipeline } from "@/lib/contract";

import { errors, load, sellerPipeline } from "./fixtures";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Screen({ payload }: { payload: SellerPipeline }) {
  const [selected, setSelected] = useState<string | null>(null);
  return <Portfolio payload={payload} selected={selected} onSelect={setSelected} />;
}

describe("carteira", () => {
  test("grupos, linhas e painel com os textos do catálogo", () => {
    const payload = sellerPipeline("pipeline-ana-alfa");
    render(<Screen payload={payload} />);
    for (const group of payload.groups) {
      expect(screen.getByRole("heading", { name: new RegExp(`^${GROUP_LABELS[group.state]}`) })).toBeTruthy();
    }
    const item = payload.groups[0].items[0];
    fireEvent.click(screen.getByRole("button", { name: UI.whyHereFor(item.opportunity_id) }));
    const panel = screen.getByRole("complementary", { name: UI.whyHere });
    for (const reason of item.reasons) expect(within(panel).getByText(reasonText(reason))).toBeTruthy();
    expect(within(panel).getByText(actionText(item.next_action))).toBeTruthy();
    fireEvent.click(within(panel).getByRole("button", { name: UI.closePanel }));
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  test("Focar vazio aponta o próximo grupo", () => {
    const payload = sellerPipeline("pipeline-bruno-beta");
    render(<Screen payload={payload} />);
    const focar = payload.groups[0];
    expect(focar.empty?.code).toBe("start_with_group");
    expect(screen.getByText(groupEmptyText(focar.empty!))).toBeTruthy();
  });

  test("vendedor sem oportunidades abertas", () => {
    const payload = sellerPipeline("pipeline-carla-gama");
    render(<Screen payload={payload} />);
    expect(screen.getByText(pipelineEmptyText(payload.empty!))).toBeTruthy();
  });
});

describe("página com a API simulada", () => {
  function stubApi(pipeline: { status: number; body: unknown }) {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
      if (url.endsWith("/api/sellers")) return reply(200, load("sellers"));
      if (url.endsWith("/api/meta")) return reply(200, load("meta"));
      return reply(pipeline.status, pipeline.body);
    }));
  }

  async function pickSeller(name: string) {
    render(<Page />);
    const select = await screen.findByRole("combobox");
    await waitFor(() => expect((select as HTMLSelectElement).disabled).toBe(false));
    fireEvent.change(select, { target: { value: name } });
  }

  test("resposta válida mostra a carteira", async () => {
    stubApi({ status: 200, body: load("pipeline-ana-alfa") });
    await pickSeller("Ana Alfa");
    expect(await screen.findByRole("heading", { name: /^Focar/ })).toBeTruthy();
  });

  test("resposta fora do contrato vira mensagem de erro, não tela quebrada", async () => {
    const body = structuredClone(load("pipeline-ana-alfa")) as any;
    body.groups[0].items[0].reasons[0].code = "alta_chance";
    stubApi({ status: 200, body });
    await pickSeller("Ana Alfa");
    expect((await screen.findByRole("alert")).textContent).toBe(CONTRACT_ERROR);
  });

  test("erro da API usa o texto do catálogo para o código", async () => {
    stubApi({ status: 404, body: (load("errors") as Record<string, unknown>)["404"] });
    await pickSeller("Ana Alfa");
    expect((await screen.findByRole("alert")).textContent).toBe(errorText(errors()["404"]));
  });
});
