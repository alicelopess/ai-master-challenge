"use client";

import { ArrowRight, Inbox } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DataWarning, ErrorAlert } from "@/components/app/error-alert";
import { PageHeader } from "@/components/app/page-header";
import { GroupTabs } from "@/components/portfolio/group-tabs";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { ReasonSheet } from "@/components/portfolio/reason-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PAGES, TEAM, UI, pipelineEmptyText } from "@/copy/pt-BR";
import { api } from "@/lib/api";
import type { Group } from "@/lib/contract";
import { formatInt } from "@/lib/format";
import { defaultTab } from "@/lib/portfolio";
import { filterOptions } from "@/lib/team";
import { useApi } from "@/lib/use-api";
import { useQuery } from "@/lib/use-query";

import { BySellerTable } from "./by-seller-table";
import { TeamFilters } from "./team-filters";
import { TeamSummary } from "./team-summary";

export function TeamPage() {
  const [query, setQuery] = useQuery();
  const manager = query.get("gerente");
  const office = query.get("escritorio");
  const sellers = useApi(() => api.sellers(), "sellers");
  const key = `team:${manager ?? ""}:${office ?? ""}`;
  const pipeline = useApi(() => api.teamPipeline({ manager, office }), key);
  const [selected, setSelected] = useState<string | null>(null);

  const options = filterOptions(sellers.data?.sellers ?? [], manager, office);
  const payload = pipeline.data;
  const fromQuery = query.get("grupo");
  const tab = payload?.groups.some((g) => g.state === fromQuery) ? (fromQuery as Group["state"]) : payload && defaultTab(payload);
  const openGroup = payload?.groups.find((g) => g.items.some((i) => i.opportunity_id === selected));
  const error = sellers.error ?? pipeline.error;
  // Duas análises sob os números, em abas, para a página não virar uma rolagem longa. Fica na URL.
  const view = query.get("visao") === "oportunidades" ? "oportunidades" : "vendedores";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={PAGES.equipe.title}
        description={PAGES.equipe.description}
        actions={
          <Button asChild variant="link" className="w-fit px-0 text-primary-strong">
            <Link href="/evidencia">
              {TEAM.seeEvidence}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      />

      <TeamFilters
        managers={options.managers}
        offices={options.offices}
        manager={manager}
        office={office}
        onChange={(changes) => {
          setSelected(null);
          setQuery({ ...changes, grupo: null });
        }}
      />

      {error && <ErrorAlert message={error} />}

      {pipeline.loading && (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label={UI.loading}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((n) => <Skeleton key={n} className="h-32 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}

      {payload && tab && (
        <>
          {!payload.meta.audited && <DataWarning />}
          <TeamSummary payload={payload} />
          <Tabs value={view} onValueChange={(next) => setQuery({ visao: next === "oportunidades" ? next : null })}
                className="gap-6">
            <TabsList variant="line" aria-label={TEAM.views.label} className="w-full self-center sm:w-fit">
              <TabsTrigger value="vendedores" className="px-2 after:bg-primary sm:px-4">
                {TEAM.views.sellers}
                <Badge variant="secondary" className="tabular-nums">{formatInt(payload.by_seller.length)}</Badge>
              </TabsTrigger>
              <TabsTrigger value="oportunidades" className="px-2 after:bg-primary sm:px-4">
                {TEAM.views.opportunities}
                <Badge variant="secondary" className="tabular-nums">{formatInt(payload.summary.total)}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vendedores">
              {payload.by_seller.length ? (
                <BySellerTable key={key} rows={payload.by_seller} />
              ) : (
                <EmptyState text={TEAM.noSellers} />
              )}
            </TabsContent>

            <TabsContent value="oportunidades" className="flex flex-col gap-6">
              {payload.empty ? (
                <EmptyState text={pipelineEmptyText(payload.empty)} />
              ) : (
                <>
                  <PortfolioSummary payload={payload} counts={false} />
                  <GroupTabs
                    key={key}
                    groups={payload.groups}
                    tab={tab}
                    onTab={(state) => setQuery({ grupo: state })}
                    selected={selected}
                    onSelect={setSelected}
                    cycleLimitDays={payload.meta.cycle_limit_days}
                    showSeller
                  />
                </>
              )}
            </TabsContent>
          </Tabs>
          <ReasonSheet items={openGroup?.items ?? []} selected={selected} onSelect={setSelected} />
        </>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox aria-hidden />
        </EmptyMedia>
        <EmptyDescription>{text}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
