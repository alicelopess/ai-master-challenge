"use client";

import { useState } from "react";

import { TablePagination } from "@/components/app/table-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DIMENSION_LABELS, INTELLIGENCE } from "@/copy/pt-BR";
import type { IntelligenceFilter, SellerProductMatrix as Matrix } from "@/lib/contract";
import { formatInt } from "@/lib/format";
import { heatLevel } from "@/lib/intelligence";
import { PAGE_SIZE } from "@/lib/pagination";
import { cn } from "@/lib/utils";

const text = INTELLIGENCE.matrix;
// A cor só acompanha a fatia que está escrita na célula (cor nunca sozinha).
const HEAT = ["", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"] as const;

/** O mix de cada vendedor, na ordem da API (alfabética). Sem taxa de ganho por célula e sem ordenação. */
export function SellerProductMatrix({ matrix, onDeals }: {
  matrix: Matrix; onDeals: (segment: Partial<IntelligenceFilter>) => void;
}) {
  const [page, setPage] = useState(1);
  const rows = matrix.rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <section aria-labelledby="matriz" className="flex scroll-mt-24 flex-col gap-4">
      <Card className="gap-4 pb-0">
        <CardHeader>
          <CardTitle id="matriz" className="text-lg font-semibold">{text.title}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">{DIMENSION_LABELS.seller}</TableHead>
                {matrix.products.map((product) => <TableHead key={product} className="text-right">{product}</TableHead>)}
                <TableHead className="pr-6 text-right">{text.total}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.seller} className="hover:bg-transparent">
                  <TableCell className="pl-6 font-medium">{row.seller}</TableCell>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.product} className="p-1 text-right">
                      {cell.closed ? (
                        <Button variant="ghost" size="sm" aria-label={text.cellLabel(row.seller, cell.product)}
                                className={cn("w-full justify-end tabular-nums", HEAT[heatLevel(cell.mix_share)])}
                                onClick={() => onDeals({ seller: row.seller, product: cell.product })}>
                          {text.cell(cell.closed, cell.mix_share)}
                        </Button>
                      ) : (
                        <span className="px-3 text-muted-foreground tabular-nums">{formatInt(0)}</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="pr-6 text-right tabular-nums">{formatInt(row.closed)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination page={page} total={matrix.rows.length} pageSize={PAGE_SIZE} onPage={setPage} />
        </CardContent>
        <CardFooter className="flex-col items-start gap-1 border-t pb-6 text-sm text-pretty text-muted-foreground">
          <p>{text.help}</p>
          <p>{text.noRate}</p>
        </CardFooter>
      </Card>
    </section>
  );
}
