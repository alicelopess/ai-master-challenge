import type { Metadata } from "next";
import type { ReactNode } from "react";

import { UI } from "@/copy/pt-BR";

import "./globals.css";

export const metadata: Metadata = {
  title: UI.pageTitle,
  description: UI.pageDescription,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
