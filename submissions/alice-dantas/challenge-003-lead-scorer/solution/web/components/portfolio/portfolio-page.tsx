"use client";

import { ChartNoAxesColumnIncreasing, Inbox } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { DataWarning, ErrorAlert } from "@/components/app/error-alert";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { BRAND, PAGES, UI, pipelineEmptyText } from "@/copy/pt-BR";
import { api } from "@/lib/api";
import type { Group } from "@/lib/contract";
import {
  defaultTab, filterGroups, filtersToQuery, hasFilters, parseFilters, productsIn, startGroup, type ListFilters,
} from "@/lib/portfolio";
import { useApi } from "@/lib/use-api";
import { useQuery } from "@/lib/use-query";

import { GroupTabs } from "./group-tabs";
import { ListFiltersBar, ListFiltersStatus } from "./list-filters";
import { NextStepCard } from "./next-step-card";
import { ReasonSheet } from "./reason-sheet";
import { SellerCombobox } from "./seller-combobox";

// Último vendedor escolhido neste navegador: na segunda de manhã a lista abre direto.
const LAST_SELLER = "rankio.vendedor";

function remembered(): string | null {
  try {
    return window.localStorage.getItem(LAST_SELLER);
  } catch {
    return null;
  }
}

function remember(name: string) {
  try {
    window.localStorage.setItem(LAST_SELLER, name);
  } catch {
    // sem armazenamento (janela privada): só não lembra
  }
}

export function PortfolioPage() {
  const [query, setQuery] = useQuery();
  const seller = query.get("vendedor") ?? "";
  const sellers = useApi(() => api.sellers(), "sellers");
  const pipeline = useApi(seller ? () => api.sellerPipeline(seller) : null, `pipeline:${seller}`);
  const [selected, setSelected] = useState<string | null>(null);

  const names = sellers.data?.sellers ?? [];
  useEffect(() => {
    if (seller || !names.length) return;
    const last = remembered();
    if (last && names.some((s) => s.name === last)) setQuery({ vendedor: last });
  }, [seller, names, setQuery]);

  useEffect(() => {
    setSelected(null);
    if (seller) remember(seller);
  }, [seller]);

  const payload = pipeline.data;
  const fromQuery = query.get("grupo");
  const tab = payload?.groups.some((g) => g.state === fromQuery) ? (fromQuery as Group["state"]) : payload && defaultTab(payload);
  const filters = parseFilters(query);
  const groups = payload ? filterGroups(payload.groups, filters) : [];
  const openGroup = groups.find((g) => g.items.some((i) => i.opportunity_id === selected));

  const pickSeller = (name: string) => setQuery({ vendedor: name, grupo: null });
  const changeFilters = useCallback((next: ListFilters) => setQuery(filtersToQuery(next)), [setQuery]);
  const showGroup = (state: Group["state"]) => {
    setQuery({ grupo: state });
    document.getElementById("grupos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const error = sellers.error ?? pipeline.error;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={PAGES.carteira.title}
        description={PAGES.carteira.description}
        actions={<SellerCombobox sellers={names} value={seller} onChange={pickSeller} />}
      />

      {error && <ErrorAlert message={error} />}

      {!seller && !error && (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ChartNoAxesColumnIncreasing className="text-primary" aria-hidden />
            </EmptyMedia>
            <EmptyTitle>{BRAND.tagline}</EmptyTitle>
            <EmptyDescription>{UI.pickSellerHint}</EmptyDescription>
          </EmptyHeader>
          <Badge variant="secondary" className="h-auto rounded-md px-2.5 py-1 font-normal whitespace-normal">
            {BRAND.pill}
          </Badge>
        </Empty>
      )}

      {pipeline.loading && (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label={UI.loading}>
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {payload && tab && (
        <>
          {!payload.meta.audited && <DataWarning />}
          {payload.empty ? (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox aria-hidden />
                </EmptyMedia>
                <EmptyDescription>{pipelineEmptyText(payload.empty)}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <NextStepCard payload={payload} onSelect={setSelected} onShowGroup={showGroup} />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">{UI.portfolioTitle}</h2>
                  <Badge variant="secondary" className="tabular-nums" aria-label={`${UI.portfolioCount}: ${payload.summary.total}`}>
                    {payload.summary.total}
                  </Badge>
                </div>
                <ListFiltersBar filters={filters} onChange={changeFilters} products={productsIn(payload.groups)}
                                className="sm:flex-1 sm:justify-end" />
              </div>
              <ListFiltersStatus filters={filters} shown={groups.reduce((sum, g) => sum + g.items.length, 0)}
                                 total={payload.summary.total} />
              <GroupTabs
                key={`${seller}:${JSON.stringify(filters)}`}
                groups={groups}
                tab={tab}
                onTab={(state) => setQuery({ grupo: state })}
                selected={selected}
                onSelect={setSelected}
                limits={payload.meta}
                filtered={hasFilters(filters)}
                actionShownFor={startGroup(payload)?.state}
              />
            </>
          )}
          <ReasonSheet items={openGroup?.items ?? []} selected={selected} onSelect={setSelected} meta={payload.meta} />
        </>
      )}
    </div>
  );
}
