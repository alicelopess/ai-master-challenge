import type { ReactNode } from "react";

import { UI, bandTitle, clientText, missingShort, tieText } from "@/copy/pt-BR";
import type { Item } from "@/lib/contract";
import { formatDate, formatInt } from "@/lib/format";

type Props = {
  items: Item[];
  selected: string | null;
  onSelect: (id: string) => void;
};

export function ItemsTable({ items, selected, onSelect }: Props) {
  const bandCounts = new Map<string, number>();
  items.forEach((item) => {
    const band = bandTitle(item.value_band);
    bandCounts.set(band, (bandCounts.get(band) ?? 0) + 1);
  });

  // Cabeçalhos de faixa e de empate entre as linhas, na ordem que veio da API.
  const rows: ReactNode[] = [];
  let band: string | null = null;
  let product: string | null | undefined;
  items.forEach((item) => {
    const title = bandTitle(item.value_band);
    if (title !== band) {
      band = title;
      product = undefined;
      rows.push(
        <tr key={`band-${band}`} className="band">
          <th colSpan={6} scope="colgroup">
            {band} ({bandCounts.get(band)})
          </th>
        </tr>,
      );
    }
    const tied = item.tie_size > 1 && item.sales_price !== null;
    if (tied && item.product !== product && item.product && item.sales_price !== null) {
      rows.push(
        <tr key={`tie-${item.opportunity_id}`} className="tie">
          <td colSpan={6}>{tieText(item.tie_size, item.product, item.sales_price)}</td>
        </tr>,
      );
    }
    product = item.product;
    rows.push(
      <Row key={item.opportunity_id} item={item} tied={tied} active={selected === item.opportunity_id}
           onSelect={onSelect} />,
    );
  });

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">{UI.columns.id}</th>
            <th scope="col">{UI.columns.product}</th>
            <th scope="col">{UI.columns.client}</th>
            <th scope="col" className="num">{UI.columns.price}</th>
            <th scope="col">{UI.columns.engaged}</th>
            <th scope="col" className="num">{UI.columns.age}</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

type RowProps = {
  item: Item;
  tied: boolean;
  active: boolean;
  onSelect: (id: string) => void;
};

function Row({ item, tied, active, onSelect }: RowProps) {
  const classes = ["item", tied && "tied", active && "active"].filter(Boolean).join(" ");
  return (
    <tr className={classes} onClick={() => onSelect(item.opportunity_id)}>
      <td>
        <button
          type="button"
          className="link"
          aria-pressed={active}
          aria-label={UI.whyHereFor(item.opportunity_id)}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(item.opportunity_id);
          }}
        >
          {item.opportunity_id}
        </button>
      </td>
      <td>
        {item.product || UI.empty}
        {item.missing_field && <span className="reason">{missingShort(item.missing_field)}</span>}
      </td>
      <td className={item.account ? undefined : "muted"}>{clientText(item)}</td>
      <td className="num">{item.sales_price === null ? UI.empty : formatInt(item.sales_price)}</td>
      <td>{item.engage_date ? formatDate(item.engage_date) : UI.empty}</td>
      <td className="num">{item.age_days === null ? UI.empty : UI.ageDays(item.age_days)}</td>
    </tr>
  );
}
