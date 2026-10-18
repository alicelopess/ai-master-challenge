"use client";

import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { TablePagination } from "@/components/app/table-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GROUP_LABELS, TEAM, UI } from "@/copy/pt-BR";
import type { Ordering, SellerSummary } from "@/lib/contract";
import { formatInt } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/pagination";
import { cn } from "@/lib/utils";

/** A carteira de cada vendedor do filtro, na ordem da API (alfabética). Sem controles de ordenação:
 * a tela não ranqueia pessoas (AC-2.9). As colunas de grupo seguem `ordering.group_order`, então um
 * grupo novo do back aparece sem mudar este componente. O nome leva à carteira do vendedor. */
export function BySellerTable({ rows, groups }: { rows: SellerSummary[]; groups: Ordering["group_order"] }) {
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const header = [UI.columns.seller, TEAM.total, ...groups.map((state) => GROUP_LABELS[state]), TEAM.withoutAccount];
    const lines = rows.map((row) => [row.seller, row.total, ...groups.map((state) => row[state]), row.without_account]);
    const text = [header, ...lines].map((line) => line.join("\t")).join("\n");
    navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false));
  };
  const visible = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const cell = (key: string, value: number, className?: string) => (
    <TableCell key={key} className={cn("text-right tabular-nums", value === 0 && "text-muted-foreground", className)}>
      {formatInt(value)}
    </TableCell>
  );
  return (
    <Card className="gap-4 pb-0">
      <CardHeader>
        <CardDescription>{TEAM.bySellerHelp}</CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button variant="outline" size="sm" title={TEAM.copyTableHelp} onClick={copy}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {TEAM.copyTable}
          </Button>
          <span role="status" className="text-xs text-muted-foreground">{copied ? TEAM.tableCopied : ""}</span>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">{UI.columns.seller}</TableHead>
              <TableHead className="text-right">{TEAM.total}</TableHead>
              {groups.map((state) => (
                <TableHead key={state} className="text-right">{GROUP_LABELS[state]}</TableHead>
              ))}
              <TableHead className="pr-6 text-right">{TEAM.withoutAccount}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={row.seller}>
                <TableCell className="pl-6">
                  <Button asChild variant="link" size="sm" className="h-auto px-0 text-primary-strong">
                    <Link href={`/carteira?vendedor=${encodeURIComponent(row.seller)}`}>{row.seller}</Link>
                  </Button>
                </TableCell>
                {cell("total", row.total)}
                {groups.map((state) => cell(state, row[state]))}
                {cell("without_account", row.without_account, "pr-6")}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination page={page} total={rows.length} pageSize={PAGE_SIZE} onPage={setPage} />
      </CardContent>
    </Card>
  );
}
