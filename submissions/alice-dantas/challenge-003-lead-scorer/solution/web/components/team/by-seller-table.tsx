import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GROUP_LABELS, TEAM, UI } from "@/copy/pt-BR";
import type { SellerSummary } from "@/lib/contract";
import { formatInt } from "@/lib/format";
import { cn } from "@/lib/utils";

const GROUPS = ["focar", "revisar", "qualificar", "nao_pontuavel"] as const;

/** A carteira de cada vendedor do filtro, na ordem da API (alfabética). Sem controles de ordenação:
 * a tela não ranqueia pessoas (AC-2.9). O nome leva à carteira do vendedor. */
export function BySellerTable({ rows }: { rows: SellerSummary[] }) {
  const cell = (key: string, value: number, className?: string) => (
    <TableCell key={key} className={cn("text-right tabular-nums", value === 0 && "text-muted-foreground", className)}>
      {formatInt(value)}
    </TableCell>
  );
  return (
    <Card className="gap-4 pb-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{TEAM.bySellerTitle}</CardTitle>
        <CardDescription>{TEAM.bySellerHelp}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">{UI.columns.seller}</TableHead>
              <TableHead className="text-right">{TEAM.total}</TableHead>
              {GROUPS.map((state) => (
                <TableHead key={state} className="text-right">{GROUP_LABELS[state]}</TableHead>
              ))}
              <TableHead className="pr-6 text-right">{TEAM.withoutAccount}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.seller}>
                <TableCell className="pl-6">
                  <Button asChild variant="link" size="sm" className="h-auto px-0 text-primary-strong">
                    <Link href={`/carteira?vendedor=${encodeURIComponent(row.seller)}`}>{row.seller}</Link>
                  </Button>
                </TableCell>
                {cell("total", row.total)}
                {GROUPS.map((state) => cell(state, row[state]))}
                {cell("without_account", row.without_account, "pr-6")}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
