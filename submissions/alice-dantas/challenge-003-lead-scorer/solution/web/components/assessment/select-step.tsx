"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SheetFooter } from "@/components/ui/sheet";
import { ASSISTED } from "@/copy/assisted";
import { UI, clientText } from "@/copy/pt-BR";
import { MAX_SET, MIN_SET } from "@/lib/assisted/model";
import type { Item } from "@/lib/contract";
import { formatInt } from "@/lib/format";

type Props = {
  pool: Item[];
  chosen: string[];
  onChange: (ids: string[]) => void;
  onNext: () => void;
  /** IDs que já têm alguma resposta guardada. */
  assessed: Set<string>;
};

/** Etapa 1: o vendedor marca de 2 a 5 oportunidades do empate. Nada vem marcado. */
export function SelectStep({ pool, chosen, onChange, onNext, assessed }: Props) {
  const full = chosen.length >= MAX_SET;
  const toggle = (id: string, on: boolean) =>
    onChange(on ? [...chosen, id] : chosen.filter((other) => other !== id));

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">{ASSISTED.select.title}</h3>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {ASSISTED.select.counter(chosen.length)}
            {" · "}
            {chosen.length < MIN_SET ? ASSISTED.select.needMore : full ? ASSISTED.select.full : ASSISTED.card.note}
          </p>
        </div>
        <ul aria-label={ASSISTED.select.listLabel} className="flex flex-col gap-2">
          {pool.map((item) => {
            const checked = chosen.includes(item.opportunity_id);
            const inputId = `assess-${item.opportunity_id}`;
            return (
              <li key={item.opportunity_id}
                  className="flex items-start gap-3 rounded-lg border p-3 has-[[data-state=checked]]:bg-accent">
                <Checkbox id={inputId} checked={checked} disabled={!checked && full} className="mt-0.5"
                          onCheckedChange={(value) => toggle(item.opportunity_id, value === true)} />
                <Label htmlFor={inputId} className="flex flex-1 flex-col items-start gap-0.5 font-normal">
                  <span className="flex flex-wrap items-center gap-2 font-semibold">
                    {item.opportunity_id}
                    {assessed.has(item.opportunity_id) && <Badge variant="secondary">{ASSISTED.select.assessed}</Badge>}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {[item.product || UI.noProduct, clientText(item),
                      item.sales_price === null ? null : formatInt(item.sales_price)].filter(Boolean).join(" · ")}
                  </span>
                </Label>
              </li>
            );
          })}
        </ul>
      </div>
      <SheetFooter className="flex-row items-center justify-end border-t">
        <Button disabled={chosen.length < MIN_SET} onClick={onNext}>{ASSISTED.select.next}</Button>
      </SheetFooter>
    </>
  );
}
