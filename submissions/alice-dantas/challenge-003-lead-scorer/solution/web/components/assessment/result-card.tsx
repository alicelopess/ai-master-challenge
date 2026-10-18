"use client";

import { ArrowDown, ArrowUp, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ASSISTED, CATEGORY_ACTIONS, CATEGORY_LABELS, breakdownText, noteText, unknownText, whyText,
} from "@/copy/assisted";
import { UI, clientText } from "@/copy/pt-BR";
import { POLICY_VERSION } from "@/lib/assisted/model";
import type { Evaluation } from "@/lib/assisted/policy";
import type { Item } from "@/lib/contract";
import { formatDate } from "@/lib/format";

type Props = {
  evaluation: Evaluation;
  item: Item | undefined;
  /** Posição na ordem; sem ela (bloco à parte ou avaliação única), o cartão não mostra número. */
  position?: { value: number; tied: boolean; manual: boolean };
  assessedAt: string;
  policyVersion: string;
  onEdit: () => void;
  onMove?: (delta: -1 | 1) => void;
  canUp?: boolean;
  canDown?: boolean;
};

/** Um resultado: pontos e faixa, categoria, por que, o que ainda não se sabe e o que fazer agora. */
export function ResultCard({
  evaluation, item, position, assessedAt, policyVersion, onEdit, onMove, canUp, canDown,
}: Props) {
  const id = evaluation.opportunityId;
  const category = evaluation.category;
  const unknown = unknownText(evaluation);
  return (
    <Card size="sm" data-opportunity={id}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          {position && (
            <Badge variant="secondary" className="tabular-nums">
              {ASSISTED.result.position(position.value, position.tied)}
            </Badge>
          )}
          {category && <Badge variant="reference">{CATEGORY_LABELS[category]}</Badge>}
          {position?.manual && <Badge variant="outline">{ASSISTED.result.manual}</Badge>}
        </div>
        <CardTitle className="text-base">
          {id}
          {item && (
            <span className="font-normal text-muted-foreground">
              {" · "}{[item.product || UI.noProduct, clientText(item)].join(" · ")}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p>
          <span className="text-lg font-semibold tabular-nums">{ASSISTED.points(evaluation.confirmed)}</span>
          {evaluation.potential > evaluation.confirmed && (
            <span className="text-muted-foreground"> · {ASSISTED.potential(evaluation.potential)}</span>
          )}
        </p>
        {position?.tied && <p className="text-xs text-muted-foreground">{ASSISTED.result.tied}</p>}
        <dl className="flex flex-col gap-2">
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{ASSISTED.result.why}</dt>
            <dd className="leading-relaxed">
              {whyText(evaluation)}
              {evaluation.notes.map((note) => <span key={note.code} className="block">{noteText(note)}</span>)}
            </dd>
          </div>
          {unknown && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{ASSISTED.result.unknown}</dt>
              <dd>{ASSISTED.result.unknownBody(unknown)}</dd>
            </div>
          )}
          {category && (
            <div className="rounded-lg bg-accent p-3 text-accent-foreground">
              <dt className="text-xs font-medium tracking-wide uppercase">{ASSISTED.result.todo}</dt>
              <dd className="leading-relaxed">{CATEGORY_ACTIONS[category]}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{ASSISTED.result.breakdown}</dt>
            <dd className="text-xs text-muted-foreground tabular-nums">
              {evaluation.breakdown.map(breakdownText).join(" · ")}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">
          {ASSISTED.result.assessedOn(formatDate(assessedAt.slice(0, 10)))}
          {policyVersion !== POLICY_VERSION && ` · ${ASSISTED.result.recalculated}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil aria-hidden />
            {ASSISTED.result.edit}
          </Button>
          {onMove && (
            <>
              <Button size="icon-sm" variant="outline" aria-label={ASSISTED.result.up(id)} disabled={!canUp}
                      onClick={() => onMove(-1)}>
                <ArrowUp aria-hidden />
              </Button>
              <Button size="icon-sm" variant="outline" aria-label={ASSISTED.result.down(id)} disabled={!canDown}
                      onClick={() => onMove(1)}>
                <ArrowDown aria-hidden />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
