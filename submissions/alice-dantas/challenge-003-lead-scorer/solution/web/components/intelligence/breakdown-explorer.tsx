"use client";

import { Filter, List, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { TablePagination } from "@/components/app/table-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DIMENSION_LABELS, INTELLIGENCE, METRIC_LABELS, PEOPLE_DRIVERS_NOTE, UI, chanceText, driversText,
  segmentLabel, sizeLabel,
} from "@/copy/pt-BR";
import type { Breakdown, IntelligenceFilter, Segment, SizeBand } from "@/lib/contract";
import { formatCompact, formatInt, formatPct, formatWhole } from "@/lib/format";
import { METRICS, type Dimension, type MetricKey, metricValue } from "@/lib/intelligence";
import { PAGE_SIZE } from "@/lib/pagination";
import { cn } from "@/lib/utils";

import { BreakdownChart } from "./breakdown-chart";

const text = INTELLIGENCE.explore;
const CHART_ROWS = 10;

type Props = {
  breakdowns: Breakdown[];
  sizes: SizeBand[];
  dimension: Dimension;
  metric: MetricKey;
  onDimension: (dimension: Dimension) => void;
  onMetric: (metric: MetricKey) => void;
  onFilter: (changes: Partial<IntelligenceFilter>) => void;
  onDeals: (segment: Partial<IntelligenceFilter>) => void;
};

function Choice<T extends string>({ label, value, options, labels, onChange }: {
  label: string; value: T; options: readonly T[]; labels: Record<T, string>; onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={(next) => onChange(next as T)}>
        <SelectTrigger aria-label={label} className="w-full sm:w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option} value={option}>{labels[option]}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

const number = (value: number | null, format: (v: number) => string) => (value === null ? UI.empty : format(value));

/** Ação da linha só com ícone: o tooltip diz o que ela faz, e o mesmo texto é o nome para leitores de tela. */
function RowAction({ label, icon: Icon, onClick }: { label: string; icon: LucideIcon; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} onClick={onClick}>
          <Icon aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Um recorte por vez, com a tabela sempre visível. Pessoas em ordem alfabética e sem gráfico (a API manda a
 * ordem); os demais recortes por receita, com o gráfico da métrica escolhida a partir de telas médias. */
export function BreakdownExplorer({ breakdowns, sizes, dimension, metric, onDimension, onMetric, onFilter, onDeals }: Props) {
  const breakdown = breakdowns.find((b) => b.dimension === dimension) ?? breakdowns[0];
  const [page, setPage] = useState(1);
  const people = breakdown.order === "alphabetical";
  const isAccount = breakdown.dimension === "account";
  const rows = breakdown.segments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const label = (segment: Segment) => segmentLabel(breakdown.dimension, segment.key, sizes);
  const chartRows = breakdown.segments.filter((s) => s.key !== null).slice(0, CHART_ROWS)
    .map((s) => ({ label: label(s), value: metricValue(s.history, metric) }));
  const dimensions = breakdowns.map((b) => b.dimension);
  const sizeOf = (key: string | null) => {
    const band = sizes.find((b) => b.key === key);
    return band ? sizeLabel(band, sizes) : UI.empty;
  };

  return (
    <section aria-labelledby="explore" className="flex scroll-mt-24 flex-col gap-4" id="explorar">
      <h2 id="explore" className="text-lg font-semibold">{text.title}</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Choice label={text.viewBy} value={breakdown.dimension} options={dimensions} labels={DIMENSION_LABELS}
                onChange={(next) => { setPage(1); onDimension(next); }} />
        {!people && <Choice label={text.metric} value={metric} options={METRICS} labels={METRIC_LABELS} onChange={onMetric} />}
      </div>

      <Card className="gap-4 pb-0">
        <CardHeader>
          <CardTitle className="font-semibold">{DIMENSION_LABELS[breakdown.dimension]}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          {!people && chartRows.length > 1 && (
            <div className="hidden flex-col gap-1 px-6 md:flex">
              <BreakdownChart rows={chartRows} metric={metric} className="h-72" />
              <p className="text-xs text-muted-foreground">{text.chartNote}</p>
            </div>
          )}
          {breakdown.segments.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">{text.empty}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">{DIMENSION_LABELS[breakdown.dimension]}</TableHead>
                    {isAccount && <TableHead>{text.columns.sector}</TableHead>}
                    {isAccount && <TableHead>{text.columns.location}</TableHead>}
                    {isAccount && <TableHead>{text.columns.size}</TableHead>}
                    {isAccount && <TableHead className="text-right">{text.columns.products}</TableHead>}
                    {isAccount && <TableHead className="text-right">{text.columns.sellers}</TableHead>}
                    <TableHead className="text-right">{text.columns.closed}</TableHead>
                    <TableHead className="text-right">{text.columns.winRate}</TableHead>
                    <TableHead className="text-right">{text.columns.ticket}</TableHead>
                    <TableHead className="text-right">{text.columns.revenue}</TableHead>
                    <TableHead className="text-right">{text.columns.share}</TableHead>
                    <TableHead className="text-right">{text.columns.open}</TableHead>
                    <TableHead className="pr-6 text-right">{text.columns.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((segment) => {
                    const { history, profile } = segment;
                    const name = label(segment);
                    return (
                      <TableRow key={segment.key ?? "sem-dado"}>
                        <TableCell className={cn("pl-6 font-medium", segment.key === null && "text-muted-foreground")}>
                          {name}
                        </TableCell>
                        {isAccount && <TableCell>{profile?.sector ?? UI.empty}</TableCell>}
                        {isAccount && <TableCell>{profile?.location ?? UI.empty}</TableCell>}
                        {isAccount && <TableCell className="whitespace-nowrap">{sizeOf(profile?.size ?? null)}</TableCell>}
                        {isAccount && (
                          <TableCell className="text-right tabular-nums">
                            {profile ? text.productsOf(profile.products_bought, profile.products_total) : UI.empty}
                          </TableCell>
                        )}
                        {isAccount && <TableCell className="text-right tabular-nums">{profile ? profile.sellers : UI.empty}</TableCell>}
                        <TableCell className="text-right tabular-nums">{formatInt(history.closed)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {history.win_rate ? (
                            <span className="flex flex-col items-end">
                              <span>{formatPct(history.win_rate.value)}</span>
                              <span className="text-xs text-muted-foreground">
                                {text.rateRange(history.win_rate.low, history.win_rate.high)}
                              </span>
                            </span>
                          ) : UI.empty}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{number(history.ticket, formatWhole)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCompact(history.revenue)}</TableCell>
                        <TableCell className="text-right tabular-nums">{number(segment.revenue_share, formatPct)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatInt(segment.open)}</TableCell>
                        <TableCell className="pr-6 text-right">
                          {segment.key !== null && (
                            <span className="flex justify-end gap-1">
                              <RowAction label={text.filterBy(name)} icon={Filter}
                                         onClick={() => onFilter({ [breakdown.dimension]: segment.key })} />
                              <RowAction label={text.dealsOf(name)} icon={List}
                                         onClick={() => onDeals({ [breakdown.dimension]: segment.key })} />
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination page={page} total={breakdown.segments.length} pageSize={PAGE_SIZE} onPage={setPage} />
            </>
          )}
        </CardContent>
        {/* As leituras vêm depois dos números: o acaso, a decomposição e a regra das pessoas. */}
        <CardFooter className="flex-col items-start gap-1 border-t pb-6 text-sm text-pretty text-muted-foreground">
          <p>{chanceText(breakdown.dimension, breakdown.chance)}</p>
          {breakdown.drivers && <p>{driversText(breakdown.dimension, breakdown.drivers)}</p>}
          {people && <p>{breakdown.drivers ? `${PEOPLE_DRIVERS_NOTE} ` : ""}{text.peopleNote}</p>}
        </CardFooter>
      </Card>
    </section>
  );
}
