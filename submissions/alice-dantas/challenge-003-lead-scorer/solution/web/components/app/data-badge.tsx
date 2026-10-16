"use client";

import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UI, dataLabel } from "@/copy/pt-BR";
import { useMeta } from "@/lib/use-meta";

/** De quando são os dados: sempre visível, para o vendedor saber a data da lista. */
export function DataBadge() {
  const { meta, error } = useMeta();
  if (!meta && !error) return <Skeleton className="h-5 w-32 rounded-4xl" />;
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <CalendarDays aria-hidden />
      {meta ? dataLabel(meta) : UI.dataUnavailable}
    </Badge>
  );
}
