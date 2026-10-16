"use client";

// Página única. A API entrega o que a regra decidiu (grupos, ordem, códigos e números,
// validados pelo contrato em lib/api.ts); textos e layout são desta camada (copy/pt-BR.ts).
import { useEffect, useState } from "react";

import { DATA_WARNING, UI, dataLabel } from "@/copy/pt-BR";
import { ApiError, api } from "@/lib/api";
import type { Meta, Seller, SellerPipeline } from "@/lib/contract";

import { Portfolio } from "./components/Portfolio";

const message = (error: unknown): string => (error instanceof ApiError ? error.message : String(error));

export default function Page() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [seller, setSeller] = useState("");
  const [payload, setPayload] = useState<SellerPipeline | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.sellers(), api.meta()])
      .then(([list, info]) => {
        setSellers(list.sellers);
        setMeta(info);
      })
      .catch((e: unknown) => setError(message(e)));
  }, []);

  useEffect(() => {
    if (!seller) return undefined;
    let active = true;
    setLoading(true);
    setSelected(null);
    setError(null);
    api
      .sellerPipeline(seller)
      .then((body) => active && setPayload(body))
      .catch((e: unknown) => {
        if (!active) return;
        setPayload(null);
        setError(message(e));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [seller]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>{UI.title}</h1>
          <p className="muted">{meta ? dataLabel(meta) : error ? UI.dataUnavailable : UI.loadingData}</p>
        </div>
        <label className="picker">
          <span>{UI.seller}</span>
          <select value={seller} onChange={(e) => setSeller(e.target.value)} disabled={!sellers.length}>
            <option value="">{UI.pickSeller}</option>
            {sellers.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      {meta && !meta.audited && <p className="banner warning">{DATA_WARNING}</p>}
      {error && (
        <p className="banner error" role="alert">
          {error}
        </p>
      )}
      {!seller && !error && <p className="muted">{UI.pickSellerHint}</p>}
      {loading && <p className="muted">{UI.loading}</p>}
      {payload && !loading && <Portfolio payload={payload} selected={selected} onSelect={setSelected} />}
    </main>
  );
}
