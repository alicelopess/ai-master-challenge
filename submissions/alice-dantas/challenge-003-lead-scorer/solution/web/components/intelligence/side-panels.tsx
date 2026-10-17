"use client";

import { X } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INTELLIGENCE, UI, type Diagnostic, type Finding, type GroupKey } from "@/copy/pt-BR";
import type { IntelligenceFilter } from "@/lib/contract";
import { formatInt } from "@/lib/format";
import type { DealOutcome, Dimension } from "@/lib/intelligence";

import { DiagnosticsList } from "./diagnostics-list";
import { FindingsList } from "./findings-list";

export type Panel = "analyses" | "guide";

/** Painel lateral da Inteligência: título, uma linha do que ele traz e o conteúdo com rolagem própria. A largura
 * usa a mesma variante do primitivo (data-[side=right]), senão a dele vence. */
function SidePanel({ open, onClose, title, description, children }: {
  open: boolean; onClose: () => void; title: string; description: string; children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" showCloseButton={false}
                    className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label={UI.closePanel}>
                <X aria-hidden />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

type AnalysesProps = {
  open: boolean;
  onClose: () => void;
  diagnostics: Diagnostic[];
  findings: Finding[];
  filter: IntelligenceFilter;
  onDeals: (outcome: DealOutcome, group?: GroupKey) => void;
  onViewBy: (dimension: Dimension) => void;
  onJump: (section: string) => void;
};

/** "Ver análises": os diagnósticos do processo e as descobertas do recorte, em duas abas. */
export function AnalysesPanel({ open, onClose, diagnostics, findings, filter, onDeals, onViewBy, onJump }: AnalysesProps) {
  const text = INTELLIGENCE.analyses;
  const [tab, setTab] = useState("processo");
  const count = (n: number) => <Badge variant="secondary" className="tabular-nums">{formatInt(n)}</Badge>;
  return (
    <SidePanel open={open} onClose={onClose} title={text.title} description={text.help}>
      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList aria-label={text.tabsLabel}>
          <TabsTrigger value="processo">{text.process}{count(diagnostics.length)}</TabsTrigger>
          <TabsTrigger value="resultados">{text.findings}{count(findings.length)}</TabsTrigger>
        </TabsList>
        <TabsContent value="processo">
          <DiagnosticsList diagnostics={diagnostics} filter={filter} onDeals={onDeals} onViewBy={onViewBy}
                           onJump={onJump} />
        </TabsContent>
        <TabsContent value="resultados">
          <FindingsList findings={findings} onViewBy={onViewBy} onJump={onJump} />
        </TabsContent>
      </Tabs>
    </SidePanel>
  );
}

function ListSection({ title, lines }: { title: string; lines: readonly string[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="flex list-disc flex-col gap-2 pl-4 text-sm text-muted-foreground">
        {lines.map((line) => <li key={line}>{line}</li>)}
      </ul>
    </section>
  );
}

/** "Como funciona": o que cada número quer dizer, como explorar e o que a página não faz. */
export function GuidePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { guide, reading } = INTELLIGENCE;
  return (
    <SidePanel open={open} onClose={onClose} title={guide.title} description={guide.help}>
      <ListSection title={reading.title} lines={[...reading.definitions, guide.explore]} />
      <ListSection title={reading.limitsTitle} lines={reading.limits} />
    </SidePanel>
  );
}
