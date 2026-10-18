"use client";

import { cn } from "cn";
import { TriangleAlert } from "lucide-react";
import { useId } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SheetFooter } from "@/components/ui/sheet";
import { ASSISTED, CONFLICT_TEXTS, CRITERIA_LABELS, QUESTIONS, answerLabel } from "@/copy/assisted";
import { UI, clientText } from "@/copy/pt-BR";
import { DIMENSIONS, OPTIONS, type Assessment, type Dimension } from "@/lib/assisted/model";
import { conflictsOf } from "@/lib/assisted/policy";
import type { Item } from "@/lib/contract";

type Props = {
  item: Item;
  assessment: Assessment;
  /** Posição desta oportunidade na avaliação (1 a total); sem `total`, é uma avaliação só. */
  index: number;
  total: number;
  onChange: (change: (current: Assessment) => Assessment) => void;
  onBack: (() => void) | null;
  onSkip: () => void;
  onNext: () => void;
  last: boolean;
};

/** Etapa 2: as sete perguntas de uma oportunidade numa tela só. Cada resposta é guardada na hora. */
export function QuestionStep({ item, assessment, index, total, onChange, onBack, onSkip, onNext, last }: Props) {
  const prefix = useId();
  const answered = DIMENSIONS.filter((d) => assessment.answers[d] !== undefined).length;
  const conflicts = conflictsOf(assessment);

  const answer = (dimension: Dimension, value: string) =>
    onChange((current) => ({
      ...current,
      answers: { ...current.answers, [dimension]: value },
      // Mudou uma resposta: o que já tinha sido confirmado como correto volta a ser conferido.
      confirmedConflicts: [],
      actionDate: dimension === "progress" && value !== "dated" ? null : current.actionDate,
    }));

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {total > 1 && <p className="text-xs font-medium text-muted-foreground">{ASSISTED.ask.progress(index, total)}</p>}
          <div role="progressbar" aria-label={ASSISTED.ask.form(item.opportunity_id)} aria-valuemin={0}
               aria-valuemax={DIMENSIONS.length} aria-valuenow={answered}
               className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full bg-primary transition-all", WIDTHS[answered])} />
          </div>
          <h3 className="text-base font-semibold">
            {item.opportunity_id}
            <span className="font-normal text-muted-foreground">
              {" · "}{[item.product || UI.noProduct, clientText(item)].join(" · ")}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground" aria-live="polite">{ASSISTED.ask.answered(answered)}</p>
        </div>

        {DIMENSIONS.map((dimension, position) => {
          const labelId = `${prefix}-${dimension}`;
          return (
            <section key={dimension} className="flex flex-col gap-2">
              <h4 id={labelId} className="text-sm font-medium">
                <span className="text-muted-foreground tabular-nums">{position + 1}. </span>
                {QUESTIONS[dimension]}
                <span className="sr-only"> ({CRITERIA_LABELS[dimension]})</span>
              </h4>
              <RadioGroup aria-labelledby={labelId} value={assessment.answers[dimension] ?? ""}
                          onValueChange={(value) => answer(dimension, value)}>
                {OPTIONS[dimension].map((option) => {
                  const id = `${prefix}-${dimension}-${option}`;
                  return (
                    <div key={option} className="flex items-start gap-2">
                      <RadioGroupItem id={id} value={option} className="mt-0.5" />
                      <Label htmlFor={id} className="font-normal">{answerLabel(dimension, option)}</Label>
                    </div>
                  );
                })}
              </RadioGroup>
              {dimension === "progress" && assessment.answers.progress === "dated" && (
                <div className="flex flex-col gap-1 pl-6">
                  <Label htmlFor={`${prefix}-date`} className="text-xs text-muted-foreground">{ASSISTED.ask.dateLabel}</Label>
                  <Input id={`${prefix}-date`} type="date" className="w-44" value={assessment.actionDate ?? ""}
                         onChange={(event) => onChange((current) => ({
                           ...current, actionDate: event.target.value || null, confirmedConflicts: [],
                         }))} />
                </div>
              )}
            </section>
          );
        })}

        {conflicts.map((code) => (
          <Alert key={code} variant="warning">
            <TriangleAlert aria-hidden />
            <AlertTitle>{ASSISTED.conflict.title}</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-2">
              <span>{CONFLICT_TEXTS[code]} {ASSISTED.conflict.question}</span>
              <span className="text-xs">{ASSISTED.conflict.hint}</span>
              <Button size="sm" variant="outline"
                      onClick={() => onChange((current) => ({
                        ...current, confirmedConflicts: [...current.confirmedConflicts, code],
                      }))}>
                {ASSISTED.conflict.keep}
              </Button>
            </AlertDescription>
          </Alert>
        ))}
      </div>
      <SheetFooter className="flex-row items-center justify-between border-t">
        {onBack ? <Button variant="outline" onClick={onBack}>{ASSISTED.ask.back}</Button> : <span />}
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onSkip}>{ASSISTED.ask.skip}</Button>
          <Button onClick={onNext}>{last ? ASSISTED.ask.finish : ASSISTED.ask.next}</Button>
        </div>
      </SheetFooter>
    </>
  );
}

// A barra de progresso usa classes prontas (o teste de design system proíbe estilo inline).
const WIDTHS = ["w-0", "w-1/7", "w-2/7", "w-3/7", "w-4/7", "w-5/7", "w-6/7", "w-full"];
