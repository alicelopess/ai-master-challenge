"use client";

import { MoveDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { INTELLIGENCE, findingText, type Finding } from "@/copy/pt-BR";
import type { Dimension } from "@/lib/intelligence";

const text = INTELLIGENCE.findings;

/** O recorte em que cada descoberta pode ser conferida, quando há um. */
function findingDimension(finding: Finding): Dimension | null {
  switch (finding.code) {
    case "win_rate_beyond_chance":
    case "revenue_concentrated":
    case "revenue_gap_drivers":
      return finding.params.dimension;
    case "account_product_coverage":
      return "account";
    default:
      return null;
  }
}

/** O que os resultados mostram: descobertas de regras fixas, com o tipo de cada uma. Fica no painel
 * "Ver análises"; o botão leva ao recorte em que a descoberta pode ser conferida. */
export function FindingsList({ findings, onViewBy, onJump }: {
  findings: Finding[]; onViewBy: (d: Dimension) => void; onJump: (section: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{text.help}</p>
      {findings.length === 0 && <p className="text-sm text-muted-foreground">{text.none}</p>}
      {findings.map((finding, index) => {
        const { title, body, kind } = findingText(finding);
        const dimension = findingDimension(finding);
        return (
          <Card key={`${finding.code}-${index}`} size="sm">
            <CardHeader>
              <Badge variant={kind === "statistical" ? "secondary" : "outline"}>{text.kinds[kind]}</Badge>
              <CardTitle className="font-semibold">{title}</CardTitle>
              <CardDescription className="text-pretty">{body}</CardDescription>
            </CardHeader>
            {(dimension || finding.code === "fast_losses") && (
              <CardFooter>
                {dimension ? (
                  <Button variant="outline" size="sm" onClick={() => onViewBy(dimension)}>{text.seeBy(dimension)}</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => onJump("tempo")}>
                    <MoveDown aria-hidden />
                    {INTELLIGENCE.process.seeMonths}
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
}
