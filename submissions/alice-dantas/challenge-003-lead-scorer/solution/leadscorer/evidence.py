"""Evidência do backtest como dado (contrato v4): o que a página Evidência mostra.

Lê o resultado de `scripts/backtest.py` (`policy.EVIDENCE_PATH`) e devolve só códigos e
números. A armadilha de vazamento fica de fora: no relatório ela prova que o backtest a
detecta, mas não é uma estratégia possível. O texto de cada código é de quem apresenta.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from . import codes, policy
from .errors import DataError

METRICS = ("auc_mean", "auc_min", "auc_max", "p_at_k", "lift_at_k", "val_at_k")
DESIGN = ("cuts", "horizon_days", "top_k", "observations", "unique_opportunities", "n_boot_sellers", "audited_data")


def _unavailable(path: Path, why: str) -> DataError:
    return DataError(f"{path.name} {why}: rode scripts/backtest.py com os CSVs em data/raw/.",
                     code=codes.EVIDENCE_UNAVAILABLE, file=path.name)


def _delta(entry: Dict[str, Any]) -> Optional[Dict[str, float]]:
    if "d_val_at_k" not in entry:
        return None
    return {"value": entry["d_val_at_k"], "low": entry["d_val_low"], "high": entry["d_val_high"]}


def _ranker(entry: Dict[str, Any]) -> Dict[str, Any]:
    if entry["code"] not in codes.RANKER_CODES:
        raise KeyError(entry["code"])
    return {"code": entry["code"], **{key: entry[key] for key in METRICS},
            "cuts_auc_above_chance": entry.get("cuts_ci_above_half"),
            "delta_val": _delta(entry), "cuts_val_above_reference": entry.get("cuts_val_above_reference")}


def _rankers(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [_ranker(entry) for entry in entries if not entry["leak"]]


def load(path: Path = policy.EVIDENCE_PATH) -> Dict[str, Any]:
    """Desenho, estratégias (na ordem do relatório) e o recorte sem as que nunca fecham."""
    try:
        result = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise _unavailable(path, "não encontrado") from None
    except (OSError, ValueError):
        raise _unavailable(path, "ilegível") from None
    try:
        return {
            "design": {key: result["design"][key] for key in DESIGN},
            "reference": codes.RANKER_CURRENT_RULE,
            "rankers": _rankers(result["summary"]),
            "without_no_outcome": _rankers(result["without_no_outcome"]),
        }
    except (KeyError, TypeError):
        raise _unavailable(path, "fora do formato esperado") from None
