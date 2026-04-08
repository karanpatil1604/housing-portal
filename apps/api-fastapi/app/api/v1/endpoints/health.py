"""
Health check endpoint.

GET /health — liveness + readiness probe in one response.
Used by Docker HEALTHCHECK, Kubernetes probes, and load-balancer checks.
"""

from __future__ import annotations

from fastapi import APIRouter, status

from app.api.v1.dependencies import ModelServiceDep
from app.core.config import get_settings
from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["Operations"])

settings = get_settings()


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health / readiness probe",
    description=(
        "Returns ``healthy`` when the model is loaded and ready to serve "
        "predictions.  Returns ``degraded`` when the API is up but the model "
        "has not yet finished initialising."
    ),
)
def health_check(service: ModelServiceDep) -> HealthResponse:
    model_ok = service.is_model_loaded
    return HealthResponse(
        status="healthy" if model_ok else "degraded",
        version=settings.app_version,
        environment=settings.environment,
        model_loaded=model_ok,
        uptime_seconds=service.uptime_seconds,
    )
