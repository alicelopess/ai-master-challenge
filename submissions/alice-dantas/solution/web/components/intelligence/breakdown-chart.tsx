"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { METRIC_LABELS, metricText } from "@/copy/pt-BR";
import type { MetricKey } from "@/lib/intelligence";
import { cn } from "@/lib/utils";

type Props = { rows: { label: string; value: number | null }[]; metric: MetricKey; className?: string };

/** A métrica escolhida para as primeiras linhas da tabela. Decorativo para leitores de tela e escondido em telas
 * estreitas: a tabela traz os mesmos números. */
export function BreakdownChart({ rows, metric, className }: Props) {
  const config = { value: { label: METRIC_LABELS[metric] } } satisfies ChartConfig;
  const data = rows.map((row) => ({ label: row.label, value: row.value ?? 0 }));
  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full", className)} aria-hidden>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 64, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={180} tickLine={false} axisLine={false} fontSize={12} />
        <Bar dataKey="value" radius={4} isAnimationActive={false} fill="var(--chart-1)">
          <LabelList dataKey="value" position="right" className="fill-foreground"
                     formatter={(value: unknown) => metricText(metric, Number(value))} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
