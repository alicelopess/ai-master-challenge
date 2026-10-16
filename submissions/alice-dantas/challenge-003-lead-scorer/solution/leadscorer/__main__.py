"""CLI: `python -m leadscorer <comando>`."""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd

from . import data, policy, views
from .errors import LeadScorerError
from .fmt import fmt_date, fmt_int


def check_data(raw_dir: Path) -> int:
    dataset = data.load(raw_dir)
    frame = dataset.opportunities
    audited = sum(dataset.hashes[t] == policy.AUDITED_SHA256[t] for t in data.TABLES)
    print(f"Dados: {data.display_path(raw_dir)}")
    print(f"Hash: {audited} de {len(data.TABLES)} arquivos iguais à versão auditada")
    if not dataset.audited:
        print(policy.DATA_WARNING)
    print("Junções (linhas após cada passo):")
    for step in dataset.steps:
        gap = f"   {step.gap_label}: {fmt_int(step.gap_count)}" if step.gap_label else ""
        print(f"  {step.label:<16} {fmt_int(step.rows):>6}{gap}")
    print(f"  sem o mapa GTXPro → GTX Pro: {fmt_int(dataset.unmatched_without_map)} não casadas")
    stages = frame["deal_stage"].value_counts()
    parts = " + ".join(f"{fmt_int(stages.get(s, 0))} {s}" for s in policy.CLOSED_STAGES + policy.OPEN_STAGES)
    print(f"Oportunidades: {fmt_int(len(frame))} = {parts}")
    is_open = frame["deal_stage"].isin(policy.OPEN_STAGES)
    print(f"Abertas: {fmt_int(is_open.sum())}")
    return 0


def render_item(entry: Dict[str, Any], indent: str) -> str:
    age = "—" if entry["age_days"] is None else f"{entry['age_days']} d"
    engaged = "—" if entry["engage_date"] is None else fmt_date(pd.Timestamp(entry["engage_date"]))
    price = "—" if entry["sales_price"] is None else fmt_int(entry["sales_price"])
    line = (f"{indent}{entry['opportunity_id']:<10}{entry['product'] or '—':<16}{entry['client']:<26}"
            f"{price:>8}   {engaged:<12}{age:>6}")
    return f"{line}   ({entry['reason']})" if entry["reason"] else line


def band_title(entry: Dict[str, Any]) -> str:
    return entry["value_label"].capitalize() if entry["value_label"] else "Sem valor de tabela"


def render_list(payload: Dict[str, Any]) -> str:
    summary = payload["summary"]
    counts = " + ".join(f"{summary[group['state']]} {group['label']}" for group in payload["groups"])
    lines = [payload["meta"]["data_warning"]] if payload["meta"]["data_warning"] else []
    lines += [
        f"{payload['seller']} · {payload['meta']['data_label']}",
        f"{summary['total']} abertas = {counts}",
    ]
    if payload["empty_message"]:
        return "\n".join(lines + ["", payload["empty_message"]])
    if payload["account_warning"]:
        lines.append(f"Aviso: {payload['account_warning']}")
    lines.append(payload["legend"])
    header = f"      {'ID':<10}{'Produto':<16}{'Cliente':<26}{'Preço':>8}   {'Engajada em':<12}{'Idade':>6}"

    for group in payload["groups"]:
        lines += ["", f"{group['label'].upper()} ({group['count']})"]
        if not group["items"]:
            lines.append(f"  {group['empty_message']}")
            continue
        lines += [f"  Próximo passo: {group['next_step']}", header]
        band_counts = Counter(band_title(entry) for entry in group["items"])
        band = product = None
        for entry in group["items"]:
            if band_title(entry) != band:
                band, product = band_title(entry), None
                lines.append(f"  {band} ({band_counts[band]})")
            tied = entry["tie_size"] > 1 and entry["sales_price"] is not None
            if tied and entry["product"] != product:
                lines.append(f"    ▸ {entry['tie_size']} oportunidades de mesmo valor de tabela "
                             f"({entry['product']}, {fmt_int(entry['sales_price'])})")
            product = entry["product"]
            lines.append(render_item(entry, "        " if tied else "      "))
    return "\n".join(lines)


def render_detail(detail: Dict[str, Any]) -> str:
    entry = detail["item"]
    lines = [detail["meta"]["data_warning"]] if detail["meta"]["data_warning"] else []
    lines += [
        f"{entry['opportunity_id']} · {entry['product'] or 'sem produto'} · {entry['client']} · {detail['seller']}",
        detail["meta"]["data_label"],
        "",
        "Por que está aqui",
    ]
    lines += [f"  • {sentence['text']}" for sentence in entry["explanation"]]
    lines += ["", f"Próximo passo: {entry['next_step']}"]
    return "\n".join(lines)


def list_pipeline(raw_dir: Path, seller: str, as_of: Optional[str], as_json: bool) -> int:
    payload = views.seller_pipeline(data.load(raw_dir), seller, as_of)
    print(json.dumps(payload, ensure_ascii=False, indent=2) if as_json else render_list(payload))
    return 0


def explain_opportunity(raw_dir: Path, opportunity_id: str, as_of: Optional[str], as_json: bool) -> int:
    detail = views.opportunity_detail(data.load(raw_dir), opportunity_id, as_of)
    print(json.dumps(detail, ensure_ascii=False, indent=2) if as_json else render_detail(detail))
    return 0


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m leadscorer")
    parser.add_argument("--raw", type=Path, default=policy.RAW_DIR, help="pasta com os CSVs")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("check-data", help="presença, hash e reconciliação dos dados")
    listing = commands.add_parser("list", help='lista "Onde focar" de um vendedor')
    listing.add_argument("--seller", required=True, help='nome exato, ex.: "Zane Levy"')
    listing.add_argument("--as-of", help="data de referência AAAA-MM-DD (padrão: último fechamento)")
    listing.add_argument("--json", action="store_true", help="imprime o payload da API")
    explaining = commands.add_parser("explain", help='"Por que está aqui" de uma oportunidade aberta')
    explaining.add_argument("--id", required=True, dest="opportunity_id", help="ex.: 01XZ9CRY")
    explaining.add_argument("--as-of", help="data de referência AAAA-MM-DD (padrão: último fechamento)")
    explaining.add_argument("--json", action="store_true", help="imprime o payload da API")
    args = parser.parse_args(argv)

    try:
        if args.command == "check-data":
            return check_data(args.raw)
        if args.command == "list":
            return list_pipeline(args.raw, args.seller, args.as_of, args.json)
        if args.command == "explain":
            return explain_opportunity(args.raw, args.opportunity_id, args.as_of, args.json)
    except LeadScorerError as error:
        # Nenhuma lista parcial: o erro sai sozinho, com a mensagem para o usuário.
        print(f"Erro: {error}", file=sys.stderr)
        return 1
    return 2


if __name__ == "__main__":
    sys.exit(main())
