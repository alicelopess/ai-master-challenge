"""API HTTP fina sobre o núcleo (ADR-003): só traduz o payload de `views` para JSON.

Rodar (em solution/): `.venv/bin/uvicorn api.main:app --port 8000`.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from leadscorer import data, policy, views
from leadscorer.errors import DataError, LeadScorerError, NotFoundError, PolicyError

WEB_ORIGIN = "http://localhost:3000"
STATUS = ((DataError, 503), (PolicyError, 422), (NotFoundError, 404))


def create_app(raw_dir: Path = policy.RAW_DIR) -> FastAPI:
    app = FastAPI(title="Lead Scorer", version="0.1.0")
    app.add_middleware(CORSMiddleware, allow_origins=[WEB_ORIGIN], allow_methods=["GET"])
    cache: Dict[str, data.Dataset] = {}

    def dataset() -> data.Dataset:
        # Carga preguiçosa: a API sobe sem os CSVs e responde 503 até eles existirem.
        if "dataset" not in cache:
            cache["dataset"] = data.load(raw_dir)
        return cache["dataset"]

    @app.exception_handler(LeadScorerError)
    async def user_error(_: Request, error: LeadScorerError) -> JSONResponse:
        status = next((code for kind, code in STATUS if isinstance(error, kind)), 500)
        return JSONResponse(status_code=status, content={"detail": str(error)})

    @app.get("/api/meta")
    def get_meta(as_of: Optional[str] = None) -> Dict[str, Any]:
        current = dataset()
        return views.meta(current, views.context(current, as_of))

    @app.get("/api/sellers")
    def get_sellers() -> Dict[str, Any]:
        return {"sellers": views.sellers(dataset())}

    @app.get("/api/sellers/{seller}/pipeline")
    def get_seller_pipeline(seller: str, as_of: Optional[str] = None) -> Dict[str, Any]:
        return views.seller_pipeline(dataset(), seller, as_of)

    @app.get("/api/pipeline")
    def get_pipeline(manager: Optional[str] = None, office: Optional[str] = None,
                     as_of: Optional[str] = None) -> Dict[str, Any]:
        return views.team_pipeline(dataset(), manager, office, as_of)

    return app


app = create_app()
