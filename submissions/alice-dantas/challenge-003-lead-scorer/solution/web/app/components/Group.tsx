import { GROUP_LABELS, UI, actionText, groupEmptyText } from "@/copy/pt-BR";
import type { Group as GroupData } from "@/lib/contract";

import { ItemsTable } from "./ItemsTable";

type Props = {
  group: GroupData;
  selected: string | null;
  onSelect: (id: string) => void;
};

export function Group({ group, selected, onSelect }: Props) {
  const title = (
    <h2>
      {GROUP_LABELS[group.state]} <span className="count">({group.count})</span>
    </h2>
  );
  const body =
    group.items.length && group.next_action ? (
      <>
        <p className="next-step">
          {UI.nextStep}: {actionText(group.next_action)}
        </p>
        <ItemsTable items={group.items} selected={selected} onSelect={onSelect} />
      </>
    ) : (
      <p className="empty">{group.empty ? groupEmptyText(group.empty) : null}</p>
    );

  // O primeiro grupo da ordem fica sempre aberto; os demais começam recolhidos.
  if (group.state === "focar") {
    return (
      <section className="group focar">
        {title}
        {body}
      </section>
    );
  }
  return (
    <details className="group">
      <summary>{title}</summary>
      {body}
    </details>
  );
}
