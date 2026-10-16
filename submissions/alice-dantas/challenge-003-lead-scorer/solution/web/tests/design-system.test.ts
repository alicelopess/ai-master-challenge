// AC-5.2: composições só com primitivos do shadcn e tokens (docs/design-system.md, seção 4.1).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { expect, test } from "vitest";

import { WEB_DIR } from "./fixtures";

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "ui" ? [] : files(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

const SOURCES = [...files(join(WEB_DIR, "app")), ...files(join(WEB_DIR, "components"))];

const RULES: [string, RegExp][] = [
  ["HTML cru com equivalente shadcn (Button, Table, Select, Input, Tabs)", /<(button|table|select|input|details|summary)\b/],
  ["cor literal fora dos tokens", /#[0-9a-f]{3}(?:[0-9a-f]{3})?\b|\b(?:rgb|rgba|hsl|oklch)\(/i],
  ["estilo inline", /style=\{\{/],
];

test("há composições para verificar", () => {
  expect(SOURCES.length).toBeGreaterThan(10);
});

test.each(RULES)("nenhuma composição usa %s", (_, pattern) => {
  const offenders = SOURCES.filter((path) => pattern.test(readFileSync(path, "utf8")))
    .map((path) => relative(WEB_DIR, path));
  expect(offenders).toEqual([]);
});

test("components/ui só tem primitivos do shadcn (sem textos de tela)", () => {
  const ui = readdirSync(join(WEB_DIR, "components", "ui"));
  for (const name of ui) {
    expect(readFileSync(join(WEB_DIR, "components", "ui", name), "utf8")).not.toContain("@/copy/");
  }
});
