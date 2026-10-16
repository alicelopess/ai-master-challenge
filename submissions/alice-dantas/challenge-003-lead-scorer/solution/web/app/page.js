"use client";

// Página única: só apresenta o payload da API (ADR-003). Toda regra, texto
// de explicação e ordem vêm do núcleo Python; aqui não se calcula nada.
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_HINT = "Confira se a API está rodando: .venv/bin/uvicorn api.main:app --port 8000";

const number = (value) => value.toLocaleString("pt-BR");
const brDate = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");
const bandTitle = (item) =>
  item.value_label ? item.value_label[0].toUpperCase() + item.value_label.slice(1) : "Sem valor de tabela";

async function getJson(path) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`);
  } catch {
    throw new Error(`Não foi possível acessar a API em ${API_URL}. ${API_HINT}`);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || `A API respondeu com erro ${response.status}.`);
  return body;
}

export default function Page() {
  const [sellers, setSellers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [seller, setSeller] = useState("");
  const [payload, setPayload] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getJson("/api/sellers"), getJson("/api/meta")])
      .then(([list, info]) => {
        setSellers(list.sellers);
        setMeta(info);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!seller) return undefined;
    let active = true;
    setLoading(true);
    setSelected(null);
    setError(null);
    getJson(`/api/sellers/${encodeURIComponent(seller)}/pipeline`)
      .then((body) => active && setPayload(body))
      .catch((e) => {
        if (!active) return;
        setPayload(null);
        setError(e.message);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [seller]);

  useEffect(() => {
    const close = (event) => event.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>Onde focar</h1>
          <p className="muted">{meta ? meta.data_label : error ? "Dados indisponíveis" : "Carregando dados…"}</p>
        </div>
        <label className="picker">
          <span>Vendedor</span>
          <select value={seller} onChange={(e) => setSeller(e.target.value)} disabled={!sellers.length}>
            <option value="">Escolha seu nome</option>
            {sellers.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      {meta?.data_warning && <p className="banner warning">{meta.data_warning}</p>}
      {error && (
        <p className="banner error" role="alert">
          {error}
        </p>
      )}
      {!seller && !error && <p className="muted">Escolha seu nome para ver suas oportunidades abertas.</p>}
      {loading && <p className="muted">Carregando…</p>}
      {payload && !loading && <Portfolio payload={payload} selected={selected} onSelect={setSelected} />}
    </main>
  );
}

function Portfolio({ payload, selected, onSelect }) {
  const { summary, groups } = payload;
  const counts = groups.map((g) => `${summary[g.state]} ${g.label}`).join(" + ");
  const current = selected && groups.flatMap((g) => g.items).find((i) => i.opportunity_id === selected);

  return (
    <>
      <section className="summary" aria-label="Resumo da carteira">
        <p className="total">
          <strong>{summary.total} abertas</strong> = {counts}
        </p>
        {payload.account_warning && <p className="note">Aviso: {payload.account_warning}</p>}
        <p className="legend">{payload.legend}</p>
      </section>

      {payload.empty_message ? (
        <p className="empty">{payload.empty_message}</p>
      ) : (
        <div className={current ? "layout with-panel" : "layout"}>
          <div className="groups">
            {groups.map((group) => (
              <Group key={group.state} group={group} selected={selected} onSelect={onSelect} />
            ))}
          </div>
          {current && <Panel item={current} onClose={() => onSelect(null)} />}
        </div>
      )}
    </>
  );
}

function Group({ group, selected, onSelect }) {
  const title = (
    <h2>
      {group.label} <span className="count">({group.count})</span>
    </h2>
  );
  const body = group.items.length ? (
    <>
      <p className="next-step">Próximo passo: {group.next_step}</p>
      <ItemsTable items={group.items} selected={selected} onSelect={onSelect} />
    </>
  ) : (
    <p className="empty">{group.empty_message}</p>
  );

  if (group.state === "focar") {
    return (
      <section className="group focar">
        {title}
        {body}
      </section>
    );
  }
  return (
    <details className="group">
      <summary>{title}</summary>
      {body}
    </details>
  );
}

function ItemsTable({ items, selected, onSelect }) {
  const bandCounts = {};
  items.forEach((item) => {
    bandCounts[bandTitle(item)] = (bandCounts[bandTitle(item)] || 0) + 1;
  });

  const rows = [];
  let band = null;
  let product;
  items.forEach((item) => {
    if (bandTitle(item) !== band) {
      band = bandTitle(item);
      product = undefined;
      rows.push(
        <tr key={`band-${band}`} className="band">
          <th colSpan={6} scope="colgroup">
            {band} ({bandCounts[band]})
          </th>
        </tr>
      );
    }
    const tied = item.tie_size > 1 && item.sales_price !== null;
    if (tied && item.product !== product) {
      rows.push(
        <tr key={`tie-${item.opportunity_id}`} className="tie">
          <td colSpan={6}>
            {item.tie_size} oportunidades de mesmo valor de tabela ({item.product}, {number(item.sales_price)})
          </td>
        </tr>
      );
    }
    product = item.product;
    rows.push(
      <Row key={item.opportunity_id} item={item} tied={tied} active={selected === item.opportunity_id} onSelect={onSelect} />
    );
  });

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Produto</th>
            <th scope="col">Cliente</th>
            <th scope="col" className="num">Valor de tabela</th>
            <th scope="col">Engajada em</th>
            <th scope="col" className="num">Idade</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

function Row({ item, tied, active, onSelect }) {
  const classes = ["item", tied && "tied", active && "active"].filter(Boolean).join(" ");
  return (
    <tr className={classes} onClick={() => onSelect(item.opportunity_id)}>
      <td>
        <button
          type="button"
          className="link"
          aria-pressed={active}
          aria-label={`Por que ${item.opportunity_id} está aqui`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(item.opportunity_id);
          }}
        >
          {item.opportunity_id}
        </button>
      </td>
      <td>
        {item.product || "—"}
        {item.reason && <span className="reason">{item.reason}</span>}
      </td>
      <td className={item.account ? undefined : "muted"}>{item.client}</td>
      <td className="num">{item.sales_price === null ? "—" : number(item.sales_price)}</td>
      <td>{brDate(item.engage_date)}</td>
      <td className="num">{item.age_days === null ? "—" : `${item.age_days} d`}</td>
    </tr>
  );
}

function Panel({ item, onClose }) {
  return (
    <aside className="panel" aria-label="Por que está aqui">
      <div className="panel-head">
        <div>
          <p className="muted">
            {item.opportunity_id} · {item.product || "sem produto"} · {item.client}
          </p>
          <h2>Por que está aqui</h2>
        </div>
        <button type="button" className="close" onClick={onClose} aria-label="Fechar painel">
          ×
        </button>
      </div>
      <ul>
        {item.explanation.map((sentence) => (
          <li key={sentence.factor}>{sentence.text}</li>
        ))}
      </ul>
      <p className="next-step">
        <strong>Próximo passo:</strong> {item.next_step}
      </p>
    </aside>
  );
}
