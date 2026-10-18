import { Info } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UI, ageContextText, bandCountText, bandTitle, clientText, missingShort, type AgeContextMeta } from "@/copy/pt-BR";
import type { Item } from "@/lib/contract";
import { formatDate, formatInt } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  items: Item[];
  selected: string | null;
  onSelect: (id: string) => void;
  showSeller?: boolean;
  /** Os limites e a mediana do histórico: com eles, a idade abre o contexto histórico. */
  meta?: AgeContextMeta;
  /** A página a mostrar, como posições [início, fim) na lista; sem ela, todas. As contagens de faixa
   * continuam sendo da lista inteira. */
  range?: [number, number];
  /** O selo de cada oportunidade já avaliada na priorização assistida, por ID. Não muda a ordem da lista. */
  marks?: Record<string, string>;
};

function HelpHead({ label, help, className }: { label: string; help: string; className?: string }) {
  return (
    <TableHead className={cn("whitespace-normal", className)}>
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

/** Lista na ordem que veio da API, com uma linha de título para cada faixa de valor de tabela. */
export function ItemsTable({ items, selected, onSelect, showSeller = false, meta, range, marks }: Props) {
  const columns = showSeller ? 7 : 6;
  const bandCounts = new Map<string, number>();
  items.forEach((item) => {
    const band = bandTitle(item.value_band);
    bandCounts.set(band, (bandCounts.get(band) ?? 0) + 1);
  });
  const pageCounts = new Map<string, number>();
  items.slice(...(range ?? [0, items.length])).forEach((item) => {
    const band = bandTitle(item.value_band);
    pageCounts.set(band, (pageCounts.get(band) ?? 0) + 1);
  });

  const rows: ReactNode[] = [];
  let band: string | null = null;
  items.slice(...(range ?? [0, items.length])).forEach((item) => {
    const title = bandTitle(item.value_band);
    if (title !== band) {
      band = title;
      rows.push(
        <TableRow key={`band-${band}`} className="hover:bg-transparent">
          <TableHead colSpan={columns} scope="colgroup" className="h-9 bg-muted/50 text-xs font-semibold">
            {band} ({bandCountText(pageCounts.get(band) ?? 0, bandCounts.get(band) ?? 0)})
            {item.value_band && (
              <Button asChild variant="link" size="xs" className="ml-2 h-auto px-0 text-xs font-normal text-primary-strong">
                <Link href="/como-funciona">{UI.bandRangesLink}</Link>
              </Button>
            )}
          </TableHead>
        </TableRow>,
      );
    }
    rows.push(
      <Row key={item.opportunity_id} item={item} showSeller={showSeller} meta={meta} mark={marks?.[item.opportunity_id]}
           active={selected === item.opportunity_id} onSelect={onSelect} />,
    );
  });

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-4">{UI.columns.id}</TableHead>
          {showSeller && <TableHead className="whitespace-normal">{UI.columns.seller}</TableHead>}
          <TableHead>{UI.columns.product}</TableHead>
          <TableHead className="whitespace-normal">{UI.columns.client}</TableHead>
          <HelpHead label={UI.columns.price} help={UI.columnHelp.price} className="text-right" />
          <TableHead className="whitespace-normal">{UI.columns.engaged}</TableHead>
          <HelpHead label={UI.columns.age} help={UI.columnHelp.age} className="pr-4 text-right" />
        </TableRow>
      </TableHeader>
      <TableBody>{rows}</TableBody>
    </Table>
  );
}

type RowProps = {
  item: Item;
  showSeller: boolean;
  meta?: AgeContextMeta;
  mark?: string;
  active: boolean;
  onSelect: (id: string) => void;
};

function Row({ item, showSeller, meta, mark, active, onSelect }: RowProps) {
  return (
    <TableRow
      data-state={active ? "selected" : undefined}
      className="cursor-pointer data-[state=selected]:bg-accent"
      onClick={() => onSelect(item.opportunity_id)}
    >
      <TableCell className="pl-4">
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
        {mark && <Badge variant="reference" className="ml-2 h-auto whitespace-normal">{mark}</Badge>}
      </TableCell>
      {showSeller && <TableCell className="whitespace-normal">{item.sales_agent}</TableCell>}
      <TableCell>
        <span className="inline-flex items-center gap-2">
          {item.product || UI.empty}
          {item.missing_field && <Badge variant="missing">{missingShort(item.missing_field)}</Badge>}
        </span>
      </TableCell>
      <TableCell className={cn("whitespace-normal", !item.account && "text-muted-foreground")}>{clientText(item)}</TableCell>
      <TableCell className="text-right tabular-nums">
        {item.sales_price === null ? UI.empty : formatInt(item.sales_price)}
      </TableCell>
      <TableCell className="tabular-nums">{item.engage_date ? formatDate(item.engage_date) : UI.empty}</TableCell>
      <TableCell className="pr-4 text-right tabular-nums">
        {item.age_days === null ? UI.empty : meta ? <AgeContext age={item.age_days} meta={meta} /> : UI.ageDays(item.age_days)}
      </TableCell>
    </TableRow>
  );
}

/** A idade como botão discreto: abre o contexto histórico (fatos das vendas ganhas), sem cor nem contagem. */
function AgeContext({ age, meta }: { age: number; meta: AgeContextMeta }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto px-1.5 py-0.5 font-normal tabular-nums underline decoration-dotted underline-offset-4"
          aria-label={`${UI.ageDays(age)}. ${UI.ageContextHelp}`}
          onClick={(event) => event.stopPropagation()}
        >
          {UI.ageDays(age)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="gap-2 text-left" onClick={(event) => event.stopPropagation()}>
        <p className="text-xs font-medium text-muted-foreground">{UI.ageContextTitle}</p>
        <p>{ageContextText(age, meta)}</p>
        <p className="text-xs text-muted-foreground">{UI.ageContextNote}</p>
      </PopoverContent>
    </Popover>
  );
}
