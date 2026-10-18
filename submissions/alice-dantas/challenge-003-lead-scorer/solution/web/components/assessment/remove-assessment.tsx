"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ASSISTED } from "@/copy/assisted";

/** Remover a avaliação de uma oportunidade: pede confirmação ali mesmo, porque as respostas só existem neste navegador. */
export function RemoveAssessment({ id, onRemove }: { id: string; onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button size="sm" variant="ghost" className="text-destructive" aria-label={ASSISTED.remove.label(id)}
              onClick={() => setConfirming(true)}>
        <Trash2 aria-hidden />
        {ASSISTED.remove.button}
      </Button>
    );
  }
  return (
    <div role="group" aria-label={ASSISTED.remove.title}
         className="flex w-full flex-col gap-2 rounded-lg border border-destructive/40 p-3">
      <p className="font-medium">{ASSISTED.remove.title}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{ASSISTED.remove.body}</p>
      <div className="flex gap-2">
        <Button size="sm" variant="destructive" onClick={onRemove}>{ASSISTED.remove.confirm}</Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>{ASSISTED.remove.cancel}</Button>
      </div>
    </div>
  );
}
