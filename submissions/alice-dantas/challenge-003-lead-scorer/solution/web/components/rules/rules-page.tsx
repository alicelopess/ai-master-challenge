"use client";

import { ErrorAlert } from "@/components/app/error-alert";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  GROUP_LABELS, PAGES, RULES, UI, bandRange, bandTitle, dataLabel, groupDescription, legendText,
} from "@/copy/pt-BR";
import { api } from "@/lib/api";
import { useApi } from "@/lib/use-api";

/** Como a lista é montada: a política que veio de /api/rules, em linguagem de vendedor. */
export function RulesPage() {
  const { data, error, loading } = useApi(() => api.rules(), "rules");
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={PAGES.comoFunciona.title} description={PAGES.comoFunciona.description} />
      {error && <ErrorAlert message={error} />}
      {loading && <Skeleton className="h-96 w-full rounded-xl" aria-label={UI.loading} />}

      {data && meta && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{RULES.groupsTitle}</CardTitle>
              <CardDescription>{RULES.groupsHelp}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {data.ordering.group_order.map((state) => (
                  <li key={state} className="flex flex-col gap-2 rounded-lg border p-4">
                    <Badge variant={state}>{GROUP_LABELS[state]}</Badge>
                    <p className="text-sm text-muted-foreground">{groupDescription(state, meta)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="gap-4 pb-0">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{RULES.orderTitle}</CardTitle>
                <CardDescription>{legendText(data.ordering)}</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6">{RULES.bandsColumns.band}</TableHead>
                      <TableHead className="pr-6 text-right">{RULES.bandsColumns.range}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.value_bands.map((rule) => (
                      <TableRow key={rule.band}>
                        <TableCell className="pl-6">{bandTitle(rule.band)}</TableCell>
                        <TableCell className="pr-6 text-right tabular-nums">{bandRange(rule)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{RULES.ageTitle}</CardTitle>
                <CardDescription>{RULES.ageHelp}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex list-disc flex-col gap-2 pl-4 text-sm">
                  <li>{RULES.wonLimit(meta.won_cycle_limit_days, meta.cycle_percentile)}</li>
                  <li>{RULES.longestLimit(meta.cycle_limit_days)}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{RULES.limitsTitle}</CardTitle>
                <CardDescription>{dataLabel(meta)}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex list-disc flex-col gap-2 pl-4 text-sm text-muted-foreground">
                  {RULES.limits.map((limit) => <li key={limit}>{limit}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
