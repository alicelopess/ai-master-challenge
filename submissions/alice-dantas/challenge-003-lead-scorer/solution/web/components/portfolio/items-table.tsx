import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UI, bandTitle, clientText, missingShort, tieText } from "@/copy/pt-BR";
import type { Item } from "@/lib/contract";
import { formatDate, formatInt } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  items: Item[];
  selected: string | null;
  onSelect: (id: string) => void;
  showSeller?: boolean;
  /** A página a mostrar, como posições [início, fim) na lista; sem ela, todas. As contagens de faixa
   * continuam sendo da lista inteira. */
  range?: [number, number];
};

function HelpHead({ label, help, className }: { label: string; help: string; className?: string }) {
  return (
    <TableHead className={className}>
      <span className="inline-flex items-center gap-1">
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label={help} className="text-muted-foreground">
              <Info aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{help}</TooltipContent>
        </Tooltip>
      </span>
    </TableHead>
  );
}

/** Lista na ordem que veio da API, com linhas de faixa e de empate entre os blocos. */
export function ItemsTable({ items, selected, onSelect, showSeller = false, range }: Props) {
  const columns = showSeller ? 7 : 6;
  const bandCounts = new Map<string, number>();
  items.forEach((item) => {
    const band = bandTitle(item.value_band);
    bandCounts.set(band, (bandCounts.get(band) ?? 0) + 1);
  });

  const rows: ReactNode[] = [];
  let band: string | null = null;
  let product: string | null | undefined;
  items.slice(...(range ?? [0, items.length])).forEach((item) => {
    const title = bandTitle(item.value_band);
    if (title !== band) {
      band = title;
      product = undefined;
      rows.push(
        <TableRow key={`band-${band}`} className="hover:bg-transparent">
          <TableHead colSpan={columns} scope="colgroup" className="h-9 bg-muted/50 text-xs font-semibold">
            {band} ({bandCounts.get(band)})
          </TableHead>
        </TableRow>,
      );
    }
    const tied = item.tie_size > 1 && item.sales_price !== null;
    if (tied && item.product !== product && item.product && item.sales_price !== null) {
      rows.push(
        <TableRow key={`tie-${item.opportunity_id}`} className="border-b-0 hover:bg-transparent">
          <TableCell colSpan={columns} className="pt-3 pb-0 text-xs text-muted-foreground">
            {tieText(item.tie_size, item.product, item.sales_price)}
          </TableCell>
        </TableRow>,
      );
    }
    product = item.product;
    rows.push(
      <Row key={item.opportunity_id} item={item} tied={tied} showSeller={showSeller}
           active={selected === item.opportunity_id} onSelect={onSelect} />,
    );
  });

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-4">{UI.columns.id}</TableHead>
          {showSeller && <TableHead>{UI.columns.seller}</TableHead>}
          <TableHead>{UI.columns.product}</TableHead>
          <TableHead>{UI.columns.client}</TableHead>
          <HelpHead label={UI.columns.price} help={UI.columnHelp.price} className="text-right" />
          <TableHead>{UI.columns.engaged}</TableHead>
          <HelpHead label={UI.columns.age} help={UI.columnHelp.age} className="pr-4 text-right" />
        </TableRow>
      </TableHeader>
      <TableBody>{rows}</TableBody>
    </Table>
  );
}

type RowProps = {
  item: Item;
  tied: boolean;
  showSeller: boolean;
  active: boolean;
  onSelect: (id: string) => void;
};

function Row({ item, tied, showSeller, active, onSelect }: RowProps) {
  return (
    <TableRow
      data-state={active ? "selected" : undefined}
      className="cursor-pointer data-[state=selected]:bg-accent"
      onClick={() => onSelect(item.opportunity_id)}
    >
      <TableCell className={cn("pl-4", tied && "pl-8")}>
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0 font-semibold text-primary-strong"
          aria-pressed={active}
          aria-label={UI.whyHereFor(item.opportunity_id)}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(item.opportunity_id);
          }}
        >
          {item.opportunity_id}
        </Button>
      </TableCell>
      {showSeller && <TableCell>{item.sales_agent}</TableCell>}
      <TableCell>
        <span className="inline-flex items-center gap-2">
          {item.product || UI.empty}
          {item.missing_field && <Badge variant="nao_pontuavel">{missingShort(item.missing_field)}</Badge>}
        </span>
      </TableCell>
      <TableCell className={item.account ? undefined : "text-muted-foreground"}>{clientText(item)}</TableCell>
      <TableCell className="text-right tabular-nums">
        {item.sales_price === null ? UI.empty : formatInt(item.sales_price)}
      </TableCell>
      <TableCell className="tabular-nums">{item.engage_date ? formatDate(item.engage_date) : UI.empty}</TableCell>
      <TableCell className="pr-4 text-right tabular-nums">
        {item.age_days === null ? UI.empty : UI.ageDays(item.age_days)}
      </TableCell>
    </TableRow>
  );
}
