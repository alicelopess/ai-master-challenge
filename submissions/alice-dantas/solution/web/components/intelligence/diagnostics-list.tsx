"use client";

import { ArrowRight, List, MoveDown } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { INTELLIGENCE, diagnosticText, type Diagnostic, type GroupKey } from "@/copy/pt-BR";
import type { IntelligenceFilter } from "@/lib/contract";
import { type DealOutcome, type Dimension, teamHref, teamScopeOnly } from "@/lib/intelligence";

type Props = {
  diagnostics: Diagnostic[];
  filter: IntelligenceFilter;
  onDeals: (outcome: DealOutcome, group?: GroupKey) => void;
  onViewBy: (dimension: Dimension) => void;
  /** Leva a uma seção da página (fecha o painel antes). */
  onJump: (section: string) => void;
};

const text = INTELLIGENCE.process;

/** As ações de cada diagnóstico: as negociações por trás do número, ou onde ver o padrão. */
function Actions({ diagnostic, filter, onDeals, onViewBy, onJump }: Omit<Props, "diagnostics"> & { diagnostic: Diagnostic }) {
  const deals = (group?: GroupKey) => (
    <Button variant="outline" size="sm" onClick={() => onDeals("open", group)}>
      <List aria-hidden />
      {text.seeDeals}
    </Button>
  );
  const link = (href: string, label: string) => (
    <Button asChild variant="link" size="sm" className="px-0 text-primary-strong">
      <Link href={href}>
        {label}
        <ArrowRight aria-hidden />
      </Link>
    </Button>
  );
  switch (diagnostic.code) {
    case "engaging_beyond_longest_cycle":
      return (
        <>
          {deals(diagnostic.params.group)}
          {teamScopeOnly(filter) && link(teamHref(filter, diagnostic.params.group), text.seeTeam)}
        </>
      );
    case "open_without_account":
      return deals();
    case "prospecting_without_engage_date":
      return deals(diagnostic.params.group);
    case "quarter_end_outcome_mix":
    case "engagement_inflow_drop":
      return (
        <Button variant="outline" size="sm" onClick={() => onJump("tempo")}>
          <MoveDown aria-hidden />
          {text.seeMonths}
        </Button>
      );
    case "accounts_shared_by_sellers":
      return (
        <Button variant="outline" size="sm" onClick={() => onViewBy("account")}>{text.seeAccounts}</Button>
      );
    default:
      return null;
  }
}

/** Onde o processo pode melhorar: só os diagnósticos que valem no recorte, cada um com o próximo passo, e o
 * que o CRM não registra. Fica no painel "Ver análises". */
export function DiagnosticsList({ diagnostics, filter, onDeals, onViewBy, onJump }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{text.help}</p>
      {diagnostics.length === 0 && <p className="text-sm text-muted-foreground">{text.none}</p>}
      {diagnostics.map((diagnostic) => {
        const { title, body, step } = diagnosticText(diagnostic);
        return (
          <Card key={diagnostic.code} size="sm">
            <CardHeader>
              <CardTitle className="font-semibold">{title}</CardTitle>
              <CardDescription className="text-pretty">{body}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1 rounded-lg bg-accent p-3 text-accent-foreground">
                <h3 className="text-sm font-semibold">{text.nextStep}</h3>
                <p className="text-sm leading-relaxed">{step}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Actions diagnostic={diagnostic} filter={filter} onDeals={onDeals} onViewBy={onViewBy} onJump={onJump} />
            </CardFooter>
          </Card>
        );
      })}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="font-semibold">{text.crmTitle}</CardTitle>
          <CardDescription>{text.crmHelp}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm">
            {text.crmGaps.map((gap) => <li key={gap}>{gap}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
