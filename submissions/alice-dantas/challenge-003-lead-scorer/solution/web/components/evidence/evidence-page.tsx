"use client";

import { ArrowRight, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { ErrorAlert } from "@/components/app/error-alert";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EVIDENCE, PAGES, RANKER_DESCRIPTIONS, RANKER_LABELS, UI, type RankerCode } from "@/copy/pt-BR";
import { api } from "@/lib/api";
import type { Delta, RankerResult } from "@/lib/contract";
import { formatDecimal, formatPct, formatPp } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/utils";

import { EvidenceChart } from "./evidence-chart";

// As três que respondem à Head de RevOps: a regra, a alternativa óbvia (só preço) e o acaso.
const HEADLINE: RankerCode[] = ["current_rule", "list_price_only", "random"];

const deltaText = (delta: Delta) => EVIDENCE.vsReference(formatPp(delta.value));
const intervalText = (delta: Delta) => EVIDENCE.interval(formatPp(delta.low), formatPp(delta.high));

function RankerName({ code, reference, describe }: { code: RankerCode; reference: string; describe: boolean }) {
  return (
    <span className="flex flex-col gap-0.5 whitespace-normal">
      <span className="flex items-center gap-2 font-medium">
        {RANKER_LABELS[code]}
        {code === reference && <Badge variant="focar">{EVIDENCE.reference}</Badge>}
      </span>
      {describe && <span className="text-xs text-muted-foreground">{RANKER_DESCRIPTIONS[code]}</span>}
    </span>
  );
}

function DeltaCell({ delta }: { delta: Delta | null }) {
  if (!delta) return <TableCell className="text-right text-muted-foreground">{UI.empty}</TableCell>;
  return (
    <TableCell className="text-right">
      <span className="flex flex-col items-end gap-0.5">
        <span className="tabular-nums">{formatPp(delta.value)}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{intervalText(delta)}</span>
      </span>
    </TableCell>
  );
}

/** Tabela das estratégias; a completa leva a descrição e a AUC, a do recorte só o essencial. */
function RankerTable({ rankers, reference, topK, full }: {
  rankers: RankerResult[]; reference: string; topK: number; full: boolean;
}) {
  const auc = full;
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-6">{EVIDENCE.columns.strategy}</TableHead>
          <TableHead className="text-right">{EVIDENCE.columns.value(topK)}</TableHead>
          <TableHead className={cn("text-right", !auc && "pr-6")}>{EVIDENCE.columns.delta}</TableHead>
          {auc && <TableHead className="pr-6 text-right">{EVIDENCE.columns.auc}</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rankers.map((ranker) => (
          <TableRow key={ranker.code} data-state={ranker.code === reference ? "selected" : undefined}
                    className="data-[state=selected]:bg-accent">
            <TableCell className="pl-6"><RankerName code={ranker.code} reference={reference} describe={full} /></TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{formatPct(ranker.val_at_k)}</TableCell>
            <DeltaCell delta={ranker.delta_val} />
            {auc && <TableCell className="pr-6 text-right tabular-nums">{formatDecimal(ranker.auc_mean)}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function EvidencePage() {
  const { data, error, loading } = useApi(() => api.evidence(), "evidence");
  const byCode = new Map(data?.rankers.map((ranker) => [ranker.code, ranker]));
  const design = data?.design;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={PAGES.evidencia.title}
        description={PAGES.evidencia.description}
        actions={
          <Button asChild variant="link" className="w-fit px-0 text-primary-strong">
            <Link href="/equipe">
              {EVIDENCE.seeTeam}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      />

      {error && <ErrorAlert message={error} />}
      {loading && <Skeleton className="h-96 w-full rounded-xl" aria-label={UI.loading} />}

      {data && design && (
        <>
          {!design.audited_data && (
            <Alert variant="warning">
              <TriangleAlert aria-hidden />
              <AlertDescription>{EVIDENCE.notAudited}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardDescription className="font-medium text-primary-strong">{EVIDENCE.questionLabel}</CardDescription>
              <CardTitle className="text-lg leading-7 font-semibold text-pretty">
                {EVIDENCE.question(design.top_k, design.horizon_days)}
              </CardTitle>
              <CardDescription className="text-pretty">
                {EVIDENCE.method(design.cuts.length, design.cuts[0], design.cuts[design.cuts.length - 1],
                  design.horizon_days)}
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              <dl className="grid gap-4 sm:grid-cols-3">
                {HEADLINE.map((code) => byCode.get(code)).filter((r): r is RankerResult => Boolean(r)).map((ranker) => (
                  <div key={ranker.code} className={cn("flex flex-col gap-1 rounded-lg border p-4",
                    ranker.code === data.reference && "border-primary/50 bg-accent")}>
                    <dt className="text-sm text-muted-foreground">{RANKER_LABELS[ranker.code]}</dt>
                    <dd className="text-3xl font-semibold tabular-nums">{formatPct(ranker.val_at_k)}</dd>
                    {ranker.delta_val && (
                      <dd className="text-xs text-muted-foreground">
                        {deltaText(ranker.delta_val)} ({intervalText(ranker.delta_val)})
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
              <EvidenceChart evidence={data} />
            </CardContent>
          </Card>

          <Card className="gap-4 pb-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{EVIDENCE.detailTitle}</CardTitle>
              <CardDescription>{EVIDENCE.aucHelp}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <RankerTable rankers={data.rankers} reference={data.reference} topK={design.top_k} full />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="gap-4 pb-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{EVIDENCE.withoutTitle}</CardTitle>
                <CardDescription>{EVIDENCE.withoutHelp}</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <RankerTable rankers={data.without_no_outcome} reference={data.reference} topK={design.top_k}
                             full={false} />
              </CardContent>
            </Card>
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{EVIDENCE.howTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {EVIDENCE.how(design.observations, design.unique_opportunities, design.n_boot_sellers)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{EVIDENCE.limitsTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex list-disc flex-col gap-2 pl-4 text-sm text-muted-foreground">
                    {EVIDENCE.limits.map((limit) => <li key={limit}>{limit}</li>)}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
