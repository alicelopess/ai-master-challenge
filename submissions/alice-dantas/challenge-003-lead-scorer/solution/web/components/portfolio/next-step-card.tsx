import { ArrowRight, Compass } from "lucide-react";

import { ASSESSMENT_CTA } from "@/components/assessment/cta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ASSISTED } from "@/copy/assisted";
import { GROUP_LABELS, UI, actionText, clientText, groupEmptyText, tieText } from "@/copy/pt-BR";
import type { Group, Item, SellerPipeline } from "@/lib/contract";
import { formatInt } from "@/lib/format";
import { firstBlock, startGroup } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

const SHOWN = 5;

type Props = {
  payload: Pick<SellerPipeline, "groups" | "empty">;
  onSelect: (id: string) => void;
  onShowGroup: (state: Group["state"]) => void;
  /** Abre a priorização assistida com as oportunidades empatadas do topo; sem ela, o botão não aparece. */
  onAssess?: (block: Item[]) => void;
  /** O selo de cada oportunidade já avaliada, por ID. */
  marks?: Record<string, string>;
};

/** "Seu próximo passo": a ação do grupo por onde começar e o primeiro bloco da ordem que veio da API. */
export function NextStepCard({ payload, onSelect, onShowGroup, onAssess, marks }: Props) {
  const group = startGroup(payload);
  if (!group || !group.next_action) return null;
  const head = payload.groups[0];
  const headline = !head.items.length && head.empty ? groupEmptyText(head.empty) : actionText(group.next_action);
  const block = firstBlock(group);
  const first = block[0];
  const shown = block.slice(0, SHOWN);

  return (
    <Card className="ring-primary/40">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 font-medium text-primary-strong">
          <Compass className="size-4" aria-hidden />
          {UI.nextStepTitle}
        </CardDescription>
        <CardTitle className="text-base leading-6 font-medium text-pretty">{headline}</CardTitle>
        <CardAction>
          <Badge variant={group.state}>{GROUP_LABELS[group.state]}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="gap-3">
        <p className="text-sm text-muted-foreground">
          {block.length > 1 && first.product && first.sales_price !== null
            ? UI.startWithTie(tieText(block.length, first.product, first.sales_price))
            : UI.startWithOne}
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((item) => (
            <li key={item.opportunity_id}>
              <Button
                variant="outline"
                className="h-auto w-full flex-col items-start gap-0.5 px-3 py-2 text-left whitespace-normal"
                onClick={() => onSelect(item.opportunity_id)}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-semibold">{item.opportunity_id}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {item.sales_price === null ? UI.empty : formatInt(item.sales_price)}
                  </span>
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {[item.product || UI.noProduct, clientText(item),
                    item.age_days === null ? null : UI.ageDays(item.age_days)].filter(Boolean).join(" · ")}
                </span>
                {marks?.[item.opportunity_id] && (
                  <Badge variant="reference" className="mt-1 h-auto whitespace-normal">{marks[item.opportunity_id]}</Badge>
                )}
              </Button>
            </li>
          ))}
        </ul>
        {onAssess && block.length > 1 && first.sales_price !== null && (
          <div className="flex flex-col gap-2 rounded-lg bg-accent p-3 text-accent-foreground sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              {ASSISTED.card.hint}
              <span className="block text-xs text-muted-foreground">{ASSISTED.card.note}</span>
            </p>
            <Button className={cn("shrink-0", ASSESSMENT_CTA)} onClick={() => onAssess(block)}>
              {ASSISTED.card.button}
            </Button>
          </div>
        )}
        <Button variant="link" className="w-fit px-0 text-primary-strong" onClick={() => onShowGroup(group.state)}>
          {block.length > shown.length
            ? UI.moreInTab(block.length - shown.length, GROUP_LABELS[group.state])
            : UI.seeGroup(GROUP_LABELS[group.state])}
          <ArrowRight aria-hidden />
        </Button>
      </CardContent>
    </Card>
  );
}
