"use client";

import { ArrowRight, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { ErrorAlert } from "@/components/app/error-alert";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  EVIDENCE, EVIDENCE_LANGUAGES, EVIDENCE_TEXT, PAGES, RANKER_LABELS, TECH_COLUMNS, UI, type EvidenceLanguage,
  type RankerCode,
} from "@/copy/pt-BR";
import { api } from "@/lib/api";
import type { Delta, EvidenceDesign, RankerResult } from "@/lib/contract";
import { formatDecimal, formatPct, formatPp } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useQuery } from "@/lib/use-query";
import { cn } from "@/lib/utils";

import { EvidenceChart } from "./evidence-chart";

// As três que respondem à Head de RevOps: a regra servida (a referência que veio da API), a alternativa
// óbvia (só preço) e o acaso.
const headline = (reference: RankerCode): RankerCode[] => [reference, "list_price_only", "random"];
const LANGUAGES = Object.keys(EVIDENCE_LANGUAGES) as EvidenceLanguage[];

function RankerName({ code, reference, description }: { code: RankerCode; reference: string; description?: string }) {
  return (
    <span className="flex flex-col gap-0.5 whitespace-normal">
      <span className="flex items-center gap-2 font-medium">
        {RANKER_LABELS[code]}
        {code === reference && <Badge variant="reference">{EVIDENCE.reference}</Badge>}
      </span>
      {description && <span className="text-xs text-muted-foreground">{description}</span>}
    </span>
  );
}

function DeltaCell({ delta, language }: { delta: Delta | null; language: EvidenceLanguage }) {
  if (!delta) return <TableCell className="text-right text-muted-foreground">{UI.empty}</TableCell>;
  return (
    <TableCell className="max-w-64 text-right whitespace-normal">
      {language === "tecnica" ? (
        <span className="flex flex-col items-end gap-0.5 tabular-nums">
          <span>{formatPp(delta.value)}</span>
          <span className="text-xs text-muted-foreground">
            {formatPp(delta.low)} a {formatPp(delta.high)}
          </span>
        </span>
      ) : (
        <span className="text-sm">{EVIDENCE_TEXT.negocio.delta(delta)}</span>
      )}
    </TableCell>
  );
}

type TableProps = {
  rankers: RankerResult[];
  reference: string;
  design: EvidenceDesign;
  language: EvidenceLanguage;
  /** A tabela completa leva descrições e, na linguagem técnica, todas as métricas. */
  full: boolean;
};

function RankerTable({ rankers, reference, design, language, full }: TableProps) {
  const text = EVIDENCE_TEXT[language];
  const k = design.top_k;
  const tech = language === "tecnica";
  const cuts = design.cuts.length;
  const count = (value: number | null) => (value === null ? UI.empty : EVIDENCE.outOf(value, cuts));
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-6">{text.columns.strategy}</TableHead>
          <TableHead className="text-right">{text.columns.value(k)}</TableHead>
          <TableHead className="text-right">{text.columns.delta(k)}</TableHead>
          {tech && <TableHead className="text-right">{TECH_COLUMNS.hits(k)}</TableHead>}
          {tech && full && <TableHead className="text-right">{TECH_COLUMNS.lift(k)}</TableHead>}
          {tech && full && <TableHead className="text-right">{TECH_COLUMNS.auc}</TableHead>}
          {tech && full && (
            <TableHead className="w-28 text-right whitespace-normal">{TECH_COLUMNS.aucCuts}</TableHead>
          )}
          {tech && full && (
            <TableHead className="w-28 pr-6 text-right whitespace-normal">{TECH_COLUMNS.aboveReference}</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rankers.map((ranker) => (
          <TableRow key={ranker.code} data-state={ranker.code === reference ? "selected" : undefined}
                    className="data-[state=selected]:bg-accent">
            <TableCell className="min-w-56 pl-6">
              <RankerName code={ranker.code} reference={reference}
                          description={full ? text.descriptions[ranker.code] : undefined} />
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{formatPct(ranker.val_at_k)}</TableCell>
            <DeltaCell delta={ranker.delta_val} language={language} />
            {tech && <TableCell className="text-right tabular-nums">{formatPct(ranker.p_at_k)}</TableCell>}
            {tech && full && <TableCell className="text-right tabular-nums">{formatDecimal(ranker.lift_at_k)}</TableCell>}
            {tech && full && (
              <TableCell className="text-right tabular-nums">
                {formatDecimal(ranker.auc_mean)}{" "}
                <span className="text-xs text-muted-foreground">
                  ({formatDecimal(ranker.auc_min)}–{formatDecimal(ranker.auc_max)})
                </span>
              </TableCell>
            )}
            {tech && full && <TableCell className="text-right tabular-nums">{count(ranker.cuts_auc_above_chance)}</TableCell>}
            {tech && full && (
              <TableCell className="pr-6 text-right tabular-nums">{count(ranker.cuts_val_above_reference)}</TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function EvidencePage() {
  const [query, setQuery] = useQuery();
  const language: EvidenceLanguage = query.get("linguagem") === "tecnica" ? "tecnica" : "negocio";
  const text = EVIDENCE_TEXT[language];
  const { data, error, loading } = useApi(() => api.evidence(), "evidence");
  const byCode = new Map(data?.rankers.map((ranker) => [ranker.code, ranker]));
  const design = data?.design;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={PAGES.evidencia.title}
        description={PAGES.evidencia.description}
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{EVIDENCE.languageLabel}</span>
              <Select value={language}
                      onValueChange={(next) => setQuery({ linguagem: next === "tecnica" ? "tecnica" : null })}>
                <SelectTrigger aria-label={EVIDENCE.languageLabel} className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((key) => (
                    <SelectItem key={key} value={key}>{EVIDENCE_LANGUAGES[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button asChild variant="link" className="w-fit px-0 text-primary-strong">
              <Link href="/equipe">
                {EVIDENCE.seeTeam}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
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
                {text.question(design.top_k, design.horizon_days)}
              </CardTitle>
              <CardDescription className="text-pretty">
                {text.method(design.cuts.length, design.cuts[0], design.cuts[design.cuts.length - 1],
                  design.horizon_days)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
              <dl className="flex flex-col gap-3">
                {headline(data.reference).map((code) => byCode.get(code)).filter((r): r is RankerResult => Boolean(r)).map((ranker) => (
                  <div key={ranker.code} className={cn("flex flex-col gap-1 rounded-lg border p-4",
                    ranker.code === data.reference && "border-primary/50 bg-accent")}>
                    <dt className="text-sm text-muted-foreground">{RANKER_LABELS[ranker.code]}</dt>
                    <dd className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold tabular-nums">{formatPct(ranker.val_at_k)}</span>
                      <span className="text-xs text-muted-foreground">{text.headline(design.top_k)}</span>
                    </dd>
                    {ranker.delta_val && (
                      <dd className="text-xs text-muted-foreground">{text.delta(ranker.delta_val)}</dd>
                    )}
                  </div>
                ))}
              </dl>
              <EvidenceChart evidence={data} label={text.chartLabel} className="hidden h-full min-h-72 md:flex" />
            </CardContent>
          </Card>

          <Card className="gap-4 pb-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{text.detailTitle}</CardTitle>
              <CardDescription>{text.detailHelp}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <RankerTable rankers={data.rankers} reference={data.reference} design={design} language={language} full />
            </CardContent>
          </Card>

          {/* A limitação principal da evidência: em largura cheia, logo depois da comparação. */}
          <Card className="gap-4 pb-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{text.withoutTitle}</CardTitle>
              <CardDescription>{text.withoutHelp}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-0">
              <Alert variant={data.without_no_outcome_verdict.code === "reference_behind" ? "warning" : "default"}
                     className="mx-4 w-auto sm:mx-6">
                <TriangleAlert aria-hidden />
                <AlertDescription>{text.verdict(data.without_no_outcome_verdict)}</AlertDescription>
              </Alert>
              <RankerTable rankers={data.without_no_outcome} reference={data.reference} design={design}
                           language={language} full={false} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{text.howTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{text.how(design)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{text.limitsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex list-disc flex-col gap-2 pl-4 text-sm text-muted-foreground">
                  {text.limits.map((limit) => <li key={limit}>{limit}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
