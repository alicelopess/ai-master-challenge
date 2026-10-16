import type { Metadata } from "next";

import { EvidencePage } from "@/components/evidence/evidence-page";
import { NAV } from "@/copy/pt-BR";

export const metadata: Metadata = { title: NAV.evidencia };

export default function Page() {
  return <EvidencePage />;
}
