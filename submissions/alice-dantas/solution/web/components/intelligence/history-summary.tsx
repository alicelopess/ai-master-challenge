import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GROUP_LABELS, INTELLIGENCE, UI } from "@/copy/pt-BR";
import type { Intelligence } from "@/lib/contract";
import { formatCompact, formatInt, formatPct } from "@/lib/format";

function Kpi({ label, value, help }: { label: string; value: string; help?: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        {help && <span className="text-xs text-muted-foreground">{help}</span>}
      </CardContent>
    </Card>
  );
}

/** O histórico do recorte em quatro números e, à parte, a carteira aberta: valor de tabela nunca se
 * soma à receita realizada. Os grupos seguem a ordem da API. */
export function HistorySummary({ payload }: { payload: Pick<Intelligence, "history" | "open" | "ordering"> }) {
  const { history, open } = payload;
  const text = INTELLIGENCE.kpis;
  return (
    <div className="flex flex-col gap-4">
      <section aria-label={text.label} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={text.revenue} value={formatCompact(history.revenue)} help={text.revenueHelp(history.revenue)} />
        <Kpi label={text.won} value={formatInt(history.won)} help={text.wonOf(history.closed)} />
        <Kpi label={text.winRate} value={history.win_rate ? formatPct(history.win_rate.value) : UI.empty}
             help={history.win_rate ? text.winRateRange(history.win_rate.low, history.win_rate.high) : undefined} />
        <Kpi label={text.cycle}
             value={history.median_won_cycle_days === null ? UI.empty : text.days(history.median_won_cycle_days)}
             help={history.median_lost_cycle_days === null ? undefined : text.lostCycle(history.median_lost_cycle_days)} />
      </section>
      <Card size="sm" aria-label={INTELLIGENCE.open.title} role="region">
        <CardHeader>
          <CardTitle className="font-semibold">{INTELLIGENCE.open.title}</CardTitle>
          <CardDescription>
            {INTELLIGENCE.open.count(open.summary.total)} · {INTELLIGENCE.open.listValue(open.list_value)}.{" "}
            {INTELLIGENCE.open.notRevenue}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <ul aria-label={INTELLIGENCE.open.groupsLabel} className="flex flex-wrap gap-2">
            {payload.ordering.group_order.map((state) => (
              <li key={state}>
                <Badge variant={state} className="tabular-nums">
                  {GROUP_LABELS[state]} {formatInt(open.summary[state])}
                </Badge>
              </li>
            ))}
          </ul>
          {open.excluded_without_account !== null && open.excluded_without_account > 0 && (
            <p className="text-xs text-muted-foreground">{INTELLIGENCE.open.excluded(open.excluded_without_account)}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
