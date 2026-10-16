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

from .schemas import ErrorBody, Meta, SellerList, SellerPipeline, TeamPipeline

WEB_ORIGIN = "http://localhost:3000"
STATUS = ((DataError, 503), (PolicyError, 422), (NotFoundError, 404))

# Erros que cada rota pode devolver, todos com o mesmo corpo {"detail", "code", "params"}.
DATA_ERROR = {503: {"model": ErrorBody, "description": "CSVs ausentes ou inválidos"}}
AS_OF_ERROR = {422: {"model": ErrorBody, "description": "as_of inválido"}}
NOT_FOUND = {404: {"model": ErrorBody, "description": "Vendedor não encontrado"}}


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
        return JSONResponse(status_code=status,
                            content={"detail": str(error), "code": error.code, "params": error.params})

    # As frases da explicação citam só alguns campos: `exclude_unset` mantém de fora os ausentes.
    @app.get("/api/meta", response_model=Meta, responses={**DATA_ERROR, **AS_OF_ERROR})
    def get_meta(as_of: Optional[str] = None) -> Dict[str, Any]:
        current = dataset()
        return views.meta(current, views.context(current, as_of))

    @app.get("/api/sellers", response_model=SellerList, responses=DATA_ERROR)
    def get_sellers() -> Dict[str, Any]:
        return {"sellers": views.sellers(dataset())}

    @app.get("/api/sellers/{seller}/pipeline", response_model=SellerPipeline, response_model_exclude_unset=True,
             responses={**DATA_ERROR, **AS_OF_ERROR, **NOT_FOUND})
    def get_seller_pipeline(seller: str, as_of: Optional[str] = None) -> Dict[str, Any]:
        return views.seller_pipeline(dataset(), seller, as_of)

    @app.get("/api/pipeline", response_model=TeamPipeline, response_model_exclude_unset=True,
             responses={**DATA_ERROR, **AS_OF_ERROR})
    def get_pipeline(manager: Optional[str] = None, office: Optional[str] = None,
                     as_of: Optional[str] = None) -> Dict[str, Any]:
        return views.team_pipeline(dataset(), manager, office, as_of)

    return app


app = create_app()
