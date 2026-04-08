"""
Application factory.

``create_app`` is the single entry-point that wires together:
  - Settings
  - Logging
  - Middleware
  - Exception handlers
  - API routers
  - Startup / shutdown lifecycle hooks
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import v1_router
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging, get_logger
from app.services.model_service import ModelService
from app.utils.exception_handlers import register_exception_handlers
from app.utils.middleware import RequestLoggingMiddleware

logger = get_logger(__name__)


def create_app(settings: Settings | None = None) -> FastAPI:
    """
    Construct and configure the FastAPI application.

    Accepting an optional *settings* argument makes it trivial to inject
    test-specific configuration in the test suite without touching env vars.
    """
    cfg = settings or get_settings()

    # Configure logging before anything else so all startup messages are captured
    configure_logging(log_level=cfg.log_level, log_format=cfg.log_format)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
        # ── Startup ──────────────────────────────────────────────────────────
        logger.info(
            "Starting up",
            app=cfg.app_name,
            version=cfg.app_version,
            env=cfg.environment,
        )
        service = ModelService(cfg)
        service.initialise()
        app.state.model_service = service
        app.state.settings = cfg
        logger.info("Application ready")

        yield

        # ── Shutdown ─────────────────────────────────────────────────────────
        logger.info("Shutting down")

    app = FastAPI(
        title=cfg.app_name,
        version=cfg.app_version,
        description=(
            "A production-grade **Housing Price Prediction** API built with "
            "FastAPI and scikit-learn.\n\n"
            "## Endpoints\n"
            "- **`POST /api/v1/predict`** — single property price prediction\n"
            "- **`POST /api/v1/predict/batch`** — batch price predictions\n"
            "- **`GET  /api/v1/model-info`** — model coefficients & metrics\n"
            "- **`GET  /api/v1/health`** — liveness / readiness probe\n"
        ),
        contact={
            "name": "Housing Price API",
        },
        license_info={"name": "MIT"},
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── Middleware ────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)

    # ── Exception handlers ────────────────────────────────────────────────────
    register_exception_handlers(app)

    # ── Routes ────────────────────────────────────────────────────────────────
    app.include_router(v1_router, prefix=cfg.api_v1_prefix)

    # Root redirect to docs
    @app.get("/", include_in_schema=False)
    def root() -> dict[str, str]:
        return {"message": "Housing Price API — visit /docs for Swagger UI"}

    return app


# Module-level app instance used by Uvicorn / gunicorn
app = create_app()
