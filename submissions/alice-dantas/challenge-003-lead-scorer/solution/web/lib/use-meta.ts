"use client";

// `meta` da API, buscado uma vez por sessão do navegador para o cabeçalho ("Dados até …").
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { Meta } from "@/lib/contract";
import { errorMessage } from "@/lib/use-api";

let cached: Promise<Meta> | null = null;

export function useMeta(): { meta: Meta | null; error: string | null } {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    cached ??= api.meta();
    cached.then(
      (value) => active && setMeta(value),
      (e: unknown) => {
        cached = null;
        if (active) setError(errorMessage(e));
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return { meta, error };
}
