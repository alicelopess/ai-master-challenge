"use client";

import { ArrowRight, Inbox } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { TablePagination } from "@/components/app/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GROUP_LABELS, UI, actionText, groupDescription, groupEmptyText } from "@/copy/pt-BR";
import type { Group } from "@/lib/contract";
import { PAGE_SIZE, pageOf } from "@/lib/pagination";

import { ItemsTable } from "./items-table";

type State = Group["state"];

type Props = {
  groups: Group[];
  tab: State;
  onTab: (state: State) => void;
  selected: string | null;
  onSelect: (id: string) => void;
  cycleLimitDays: number;
  showSeller?: boolean;
  /** Linhas por página em cada aba. */
  pageSize?: number;
  /** Grupo cujo próximo passo já está no cartão "Seu próximo passo" (não repete a frase). */
  actionShownFor?: State;
};

/** Um grupo por aba, na ordem da API, com a contagem no rótulo. */
export function GroupTabs({
  groups, tab, onTab, selected, onSelect, cycleLimitDays, showSeller, pageSize = PAGE_SIZE, actionShownFor,
}: Props) {
  const [pages, setPages] = useState<Partial<Record<State, number>>>({});
  const tables = useRef<Partial<Record<State, HTMLDivElement | null>>>({});

  // Anterior e Próxima no painel podem passar da página: a tabela acompanha a oportunidade aberta.
  useEffect(() => {
    for (const group of groups) {
      const index = group.items.findIndex((item) => item.opportunity_id === selected);
      if (index >= 0) setPages((current) => ({ ...current, [group.state]: pageOf(index, pageSize) }));
    }
  }, [selected, groups, pageSize]);

  const goTo = (state: State, page: number) => {
    setPages((current) => ({ ...current, [state]: page }));
    tables.current[state]?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return (
    <Tabs id="grupos" value={tab} onValueChange={(value) => onTab(value as State)} className="gap-4">
      <TabsList aria-label={UI.groupsLabel} className="grid h-auto w-full grid-cols-2 sm:inline-flex sm:h-9 sm:w-fit">
        {groups.map((group) => (
          <TabsTrigger key={group.state} value={group.state} className="h-8 px-3 sm:h-[calc(100%-1px)]">
            {GROUP_LABELS[group.state]}
            <Badge variant={group.count ? group.state : "secondary"} className="tabular-nums">
              {group.count}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      {groups.map((group) => {
        const page = pages[group.state] ?? 1;
        const range: [number, number] = [(page - 1) * pageSize, page * pageSize];
        return (
          <TabsContent key={group.state} value={group.state} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground">{groupDescription(group.state, cycleLimitDays)}</p>
              {group.items.length > 0 && group.next_action && group.state !== actionShownFor && (
                <p>
                  <span className="font-medium">{UI.nextStep}:</span> {actionText(group.next_action)}
                </p>
              )}
            </div>

            {group.items.length ? (
              <Card className="scroll-mt-24 gap-0 py-0" ref={(node) => { tables.current[group.state] = node; }}>
                <ItemsTable items={group.items} selected={selected} onSelect={onSelect} showSeller={showSeller}
                            range={range} />
                <TablePagination page={page} total={group.items.length} pageSize={pageSize}
                                 onPage={(next) => goTo(group.state, next)} />
              </Card>
            ) : (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox aria-hidden />
                  </EmptyMedia>
                  <EmptyDescription>{group.empty ? groupEmptyText(group.empty) : null}</EmptyDescription>
                </EmptyHeader>
                {group.empty?.code === "start_with_group" && (
                  <EmptyContent>
                    <Button variant="outline" onClick={() => onTab(group.empty!.params.group as State)}>
                      {UI.seeGroup(GROUP_LABELS[group.empty.params.group])}
                      <ArrowRight aria-hidden />
                    </Button>
                  </EmptyContent>
                )}
              </Empty>
            )}

          </TabsContent>
        );
      })}
    </Tabs>
  );
}
