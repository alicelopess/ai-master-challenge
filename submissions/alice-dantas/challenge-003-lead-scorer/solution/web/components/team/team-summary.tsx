import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { GROUP_LABELS, UI, groupDescription } from "@/copy/pt-BR";
import type { TeamPipeline } from "@/lib/contract";
import { formatInt } from "@/lib/format";

/** Os quatro números da carteira da equipe, cada um com o que o grupo quer dizer. Sem percentuais: o front
 * não calcula valor de negócio. */
export function TeamSummary({ payload }: { payload: Pick<TeamPipeline, "groups" | "summary" | "meta"> }) {
  const { summary } = payload;
  return (
    <section aria-label={UI.teamSummaryLabel} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {payload.groups.map((group) => (
        <Card key={group.state} size="sm">
          <CardHeader>
            <Badge variant={group.state}>{GROUP_LABELS[group.state]}</Badge>
          </CardHeader>
          <CardContent className="gap-1">
            <p className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums">{formatInt(summary[group.state])}</span>
              <span className="text-sm text-muted-foreground">{UI.ofTotal(summary.total)}</span>
            </p>
            <CardDescription className="text-xs">
              {groupDescription(group.state, payload.meta.cycle_limit_days)}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
