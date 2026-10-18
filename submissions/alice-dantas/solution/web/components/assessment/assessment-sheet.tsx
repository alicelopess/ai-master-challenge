"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ASSISTED } from "@/copy/assisted";
import { UI } from "@/copy/pt-BR";
import { MAX_SET, POLICY_VERSION, emptyAssessment, type Assessment } from "@/lib/assisted/model";
import { evaluate } from "@/lib/assisted/policy";
import type { Assessments } from "@/lib/assisted/use-assessments";
import type { Item } from "@/lib/contract";

import { QuestionStep } from "./question-step";
import { ResultStep } from "./result-step";
import { SelectStep } from "./select-step";

/** O que o vendedor pediu: comparar um conjunto de empatadas ou avaliar uma oportunidade só. */
export type AssessRequest = { mode: "set" | "single"; pool: Item[] };

type Props = {
  request: AssessRequest | null;
  seller: string;
  /** A data dos dados (`meta.as_of`): é o "hoje" da avaliação. */
  asOf: string;
  store: Assessments;
  onClose: () => void;
};

type Step = "select" | "ask" | "result";

/** O painel lateral: escolher, responder e ver o resultado. Fecha e abre do zero, e as respostas ficam guardadas. */
export function AssessmentSheet({ request, seller, asOf, store, onClose }: Props) {
  return (
    <Sheet open={Boolean(request)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" showCloseButton={false}
                    className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
        {request && <Flow request={request} seller={seller} asOf={asOf} store={store} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  );
}

function Flow({ request, seller, asOf, store, onClose }: Omit<Props, "request"> & { request: AssessRequest }) {
  const single = request.mode === "single";
  const only = request.pool[0]?.opportunity_id;
  const [step, setStep] = useState<Step>(() => {
    if (!single) return "select";
    return store.byId[only] && evaluate(store.byId[only], asOf).status === "complete" ? "result" : "ask";
  });
  const [chosen, setChosen] = useState<string[]>(single && only ? [only] : []);
  const [index, setIndex] = useState(0);

  const items = Object.fromEntries(request.pool.map((item) => [item.opportunity_id, item]));
  const current = chosen[index];
  const assessmentOf = (id: string): Assessment => store.byId[id] ?? emptyAssessment(id);
  const assessed = new Set(
    request.pool.map((item) => item.opportunity_id).filter((id) => Object.keys(store.byId[id]?.answers ?? {}).length),
  );
  const edit = (id: string) => {
    setIndex(Math.max(0, chosen.indexOf(id)));
    setStep("ask");
  };
  const last = index >= chosen.length - 1;
  const advance = () => (last ? setStep("result") : setIndex(index + 1));

  return (
    <>
      <SheetHeader className="border-b">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            <SheetTitle className="text-lg font-semibold">{ASSISTED.title}</SheetTitle>
            <SheetDescription>{single ? ASSISTED.sheet.singleDescription : ASSISTED.sheet.setDescription}</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label={UI.closePanel}>
              <X aria-hidden />
            </Button>
          </SheetClose>
        </div>
      </SheetHeader>

      {step === "select" && (
        <SelectStep pool={request.pool} chosen={chosen.slice(0, MAX_SET)} assessed={assessed}
                    onChange={setChosen} onNext={() => {
                      // Na ordem da lista, não na ordem em que foram marcadas.
                      const order = request.pool.map((item) => item.opportunity_id);
                      setChosen((ids) => [...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
                      setIndex(0);
                      setStep("ask");
                    }} />
      )}
      {step === "ask" && current && (
        <QuestionStep
          key={current}
          item={items[current]}
          assessment={assessmentOf(current)}
          index={index + 1}
          total={chosen.length}
          last={last}
          onChange={(change) => store.update(current, (stored) => ({
            ...change(stored), assessedAt: new Date().toISOString(), policyVersion: POLICY_VERSION,
          }))}
          onBack={single ? null : () => (index === 0 ? setStep("select") : setIndex(index - 1))}
          onSkip={advance}
          onNext={advance}
        />
      )}
      {step === "result" && (
        <ResultStep ids={chosen} items={items} store={store} seller={seller} asOf={asOf} single={single}
                    onEdit={edit} onClose={onClose} />
      )}
    </>
  );
}
