"use client";

import { ChevronLeft, ChevronRight, Copy, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  GROUP_LABELS, ROLE_LABELS, UI, actionText, ageContextText, clientText, reasonText, suggestionText, suggestionsFor,
  tieNote, type AgeContextMeta, type ReasonRole,
} from "@/copy/pt-BR";
import type { Item } from "@/lib/contract";

// Ordem das seções: o que decidiu o grupo e o que decidiu a posição. Só entra motivo que decide.
const ROLES: ReasonRole[] = ["group", "order"];

type Props = {
  /** Os itens do grupo da oportunidade aberta, na ordem da API (para Anterior e Próxima). */
  items: Item[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** Limites e mediana do histórico, para o contexto da idade. */
  meta: AgeContextMeta;
};

/** "Por que está aqui": motivos separados pelo papel que o contrato dá a cada um, próximo passo e navegação. */
export function ReasonSheet({ items, selected, onSelect, meta }: Props) {
  const index = items.findIndex((item) => item.opportunity_id === selected);
  const item = index >= 0 ? items[index] : undefined;
  const [copied, setCopied] = useState(false);
  const tie = item ? tieNote(item) : null;

  useEffect(() => setCopied(false), [selected]);

  const copy = (id: string) => {
    navigator.clipboard?.writeText(id).then(() => setCopied(true), () => setCopied(false));
  };

  return (
    <Sheet open={Boolean(item)} onOpenChange={(open) => !open && onSelect(null)}>
      <SheetContent side="right" showCloseButton={false} className="w-full gap-0 sm:max-w-md">
        {item && (
          <>
            <SheetHeader className="border-b">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1.5">
                  <Badge variant={item.group}>{GROUP_LABELS[item.group]}</Badge>
                  <SheetTitle className="text-lg font-semibold">{UI.whyHere}</SheetTitle>
                  <SheetDescription>
                    {item.opportunity_id} · {item.product || UI.noProduct} · {clientText(item)}
                  </SheetDescription>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={UI.closePanel}>
                    <X aria-hidden />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {ROLES.map((role) => {
                const reasons = item.reasons.filter((reason) => reason.role === role);
                if (!reasons.length) return null;
                return (
                  <section key={role} className="flex flex-col gap-2">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {ROLE_LABELS[role]}
                    </h3>
                    <ul className="flex list-disc flex-col gap-2 pl-4 text-sm leading-relaxed">
                      {reasons.map((reason) => (
                        <li key={reason.code}>{reasonText(reason)}</li>
                      ))}
                      {role === "order" && tie && <li>{tie}</li>}
                    </ul>
                  </section>
                );
              })}
              {item.age_days !== null && (
                <section className="flex flex-col gap-2">
                  <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {UI.ageContextTitle}
                  </h3>
                  <p className="text-sm leading-relaxed">{ageContextText(item.age_days, meta)}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{UI.ageContextNote}</p>
                </section>
              )}
              <Separator />
              <section className="flex flex-col gap-1 rounded-lg bg-accent p-3 text-accent-foreground">
                <h3 className="text-sm font-semibold">{UI.nextStep}</h3>
                <p className="text-sm leading-relaxed">{actionText(item.next_action, item.account)}</p>
              </section>
              <section aria-label={UI.suggestionsTitle} className="flex flex-col gap-2 rounded-lg border p-3">
                <h3 className="text-sm font-semibold">{UI.suggestionsTitle}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{UI.suggestionsIntro}</p>
                <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed">
                  {suggestionsFor(item).map((suggestion) => (
                    <li key={suggestion.when}>{suggestionText(suggestion)}</li>
                  ))}
                </ul>
              </section>
              <p className="text-xs leading-relaxed text-muted-foreground">{UI.limitsNote}</p>
            </div>

            <SheetFooter className="flex-row items-center justify-between border-t">
              <Button variant="outline" size="sm" onClick={() => copy(item.opportunity_id)}>
                <Copy aria-hidden />
                {copied ? UI.copied : UI.copyId}
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon-sm" aria-label={UI.previous} disabled={index <= 0}
                        onClick={() => onSelect(items[index - 1].opportunity_id)}>
                  <ChevronLeft aria-hidden />
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">{UI.position(index + 1, items.length)}</span>
                <Button variant="outline" size="icon-sm" aria-label={UI.next} disabled={index >= items.length - 1}
                        onClick={() => onSelect(items[index + 1].opportunity_id)}>
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
