"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { RANKER_LABELS } from "@/copy/pt-BR";
import type { Evidence } from "@/lib/contract";
import { formatPct } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = { evidence: Pick<Evidence, "rankers" | "reference">; label: string; className?: string };

/** Valor capturado por estratégia, na ordem da API, com a regra atual em destaque. É decorativo para
 * leitores de tela e some em telas estreitas, onde as barras ficariam curtas demais: a tabela de
 * comparação traz os mesmos números. */
export function EvidenceChart({ evidence, label, className }: Props) {
  const config = { value: { label } } satisfies ChartConfig;
  const data = evidence.rankers.map((ranker) => ({
    code: ranker.code, label: RANKER_LABELS[ranker.code], value: ranker.val_at_k,
  }));
  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full", className)} aria-hidden>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 48, top: 4, bottom: 4 }}>
        <XAxis type="number" domain={[0, 1]} hide />
        <YAxis type="category" dataKey="label" width={210} tickLine={false} axisLine={false} fontSize={12} />
        <Bar dataKey="value" radius={4} isAnimationActive={false}>
          {data.map((entry) => (
            <Cell key={entry.code} fill={entry.code === evidence.reference ? "var(--chart-1)" : "var(--chart-2)"}
                  fillOpacity={entry.code === evidence.reference ? 1 : 0.45} />
          ))}
          <LabelList dataKey="value" position="right" className="fill-foreground"
                     formatter={(value: unknown) => formatPct(Number(value))} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
