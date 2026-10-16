import { UI, actionText, clientText, reasonText } from "@/copy/pt-BR";
import type { Item } from "@/lib/contract";

type Props = {
  item: Item;
  onClose: () => void;
};

export function Panel({ item, onClose }: Props) {
  return (
    <aside className="panel" aria-label={UI.whyHere}>
      <div className="panel-head">
        <div>
          <p className="muted">
            {item.opportunity_id} · {item.product || UI.noProduct} · {clientText(item)}
          </p>
          <h2>{UI.whyHere}</h2>
        </div>
        <button type="button" className="close" onClick={onClose} aria-label={UI.closePanel}>
          ×
        </button>
      </div>
      <ul>
        {item.reasons.map((reason) => (
          <li key={reason.code}>{reasonText(reason)}</li>
        ))}
      </ul>
      <p className="next-step">
        <strong>{UI.nextStep}:</strong> {actionText(item.next_action)}
      </p>
    </aside>
  );
}
