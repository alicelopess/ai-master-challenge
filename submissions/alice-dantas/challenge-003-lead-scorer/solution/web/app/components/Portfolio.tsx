import { UI, accountWarning, legendText, pipelineEmptyText, summaryCounts } from "@/copy/pt-BR";
import type { SellerPipeline } from "@/lib/contract";

import { Group } from "./Group";
import { Panel } from "./Panel";

type Props = {
  payload: SellerPipeline;
  selected: string | null;
  onSelect: (id: string | null) => void;
};

export function Portfolio({ payload, selected, onSelect }: Props) {
  const { summary, groups } = payload;
  const current = selected ? groups.flatMap((g) => g.items).find((i) => i.opportunity_id === selected) : undefined;

  return (
    <>
      <section className="summary" aria-label={UI.summaryLabel}>
        <p className="total">
          <strong>
            {summary.total} {UI.open}
          </strong>{" "}
          = {summaryCounts(payload)}
        </p>
        {summary.without_account > 0 && (
          <p className="note">
            {UI.warning}: {accountWarning(summary.without_account, summary.total)}
          </p>
        )}
        <p className="legend">{legendText(payload.ordering)}</p>
      </section>

      {payload.empty ? (
        <p className="empty">{pipelineEmptyText(payload.empty)}</p>
      ) : (
        <div className={current ? "layout with-panel" : "layout"}>
          <div className="groups">
            {groups.map((group) => (
              <Group key={group.state} group={group} selected={selected} onSelect={onSelect} />
            ))}
          </div>
          {current && <Panel item={current} onClose={() => onSelect(null)} />}
        </div>
      )}
    </>
  );
}
