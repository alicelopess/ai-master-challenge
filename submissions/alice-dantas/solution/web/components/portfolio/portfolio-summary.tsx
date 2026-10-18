import { Info } from "lucide-react";

import { UI, accountWarning, emptyGroupsText, legendText, summaryCounts } from "@/copy/pt-BR";
import type { SellerPipeline, TeamPipeline } from "@/lib/contract";
import { formatInt } from "@/lib/format";

type Props = {
  payload: Pick<SellerPipeline | TeamPipeline, "groups" | "summary" | "ordering">;
  /** Na equipe os números já estão nos cartões; aqui fica só a legenda e o aviso. */
  counts?: boolean;
};

/** Total, legenda da ordem e a nota sobre o cadastro do cliente (uma vez, no cabeçalho da lista). */
export function PortfolioSummary({ payload, counts = true }: Props) {
  const { summary } = payload;
  const emptyGroups = counts ? emptyGroupsText(payload) : null;
  return (
    <section aria-label={UI.summaryLabel} className="flex flex-col gap-1 text-sm">
      {counts && (
        <p>
          <strong className="font-semibold tabular-nums">
            {formatInt(summary.total)} {UI.open}
          </strong>{" "}
          <span className="text-muted-foreground">= {summaryCounts(payload)}</span>
        </p>
      )}
      {emptyGroups && <p className="text-xs text-muted-foreground">{emptyGroups}</p>}
      <p className="text-xs text-muted-foreground">{legendText(payload.ordering)}</p>
      {summary.without_account > 0 && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            {UI.note}: {accountWarning(summary.without_account, summary.total)}. {UI.accountNote}
          </span>
        </p>
      )}
    </section>
  );
}
