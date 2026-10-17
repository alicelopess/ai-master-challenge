import { ArrowRight, Compass } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GROUP_LABELS, UI, actionText, clientText, groupEmptyText, tieText } from "@/copy/pt-BR";
import type { Group, SellerPipeline } from "@/lib/contract";
import { formatInt } from "@/lib/format";
import { firstBlock, startGroup } from "@/lib/portfolio";

const SHOWN = 5;

type Props = {
  payload: Pick<SellerPipeline, "groups" | "empty">;
  onSelect: (id: string) => void;
  onShowGroup: (state: Group["state"]) => void;
};

/** "Seu próximo passo": a ação do grupo por onde começar e o primeiro bloco da ordem que veio da API. */
export function NextStepCard({ payload, onSelect, onShowGroup }: Props) {
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
              </Button>
            </li>
          ))}
        </ul>
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
