"""
Global exception handlers registered on the FastAPI application.

All ``HousingAPIError`` subclasses are caught here and converted to
structured JSON responses.  This keeps error serialisation out of the
endpoint layer entirely.
"""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.core.exceptions import HousingAPIError
from app.core.logging import get_logger
from app.schemas.prediction import ErrorResponse

logger = get_logger(__name__)


def _error_response(
    status_code: int,
    error_code: str,
    message: str,
    detail: str | None = None,
) -> JSONResponse:
    body = ErrorResponse(error_code=error_code, message=message, detail=detail)
    return JSONResponse(status_code=status_code, content=body.model_dump(exclude_none=True))


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all global exception handlers to *app*."""

    @app.exception_handler(HousingAPIError)
    async def housing_api_error_handler(
        request: Request, exc: HousingAPIError
    ) -> JSONResponse:
        logger.warning(
            "Domain error",
            error_code=exc.error_code,
            message=exc.message,
            path=str(request.url),
        )
        return _error_response(
            status_code=exc.status_code,
            error_code=exc.error_code,
            message=exc.message,
            detail=exc.detail,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # Flatten Pydantic's nested errors into a readable string
        errors = "; ".join(
            f"{' -> '.join(str(loc) for loc in e['loc'])}: {e['msg']}"
            for e in exc.errors()
        )
        logger.info(
            "Request validation failed",
            path=str(request.url),
            errors=errors,
        )
        return _error_response(
            status_code=422,
            error_code="VALIDATION_ERROR",
            message="Request body failed validation.",
            detail=errors,
        )

    @app.exception_handler(ValidationError)
    async def pydantic_error_handler(
        request: Request, exc: ValidationError
    ) -> JSONResponse:
        logger.warning("Pydantic internal validation error", detail=str(exc))
        return _error_response(
            status_code=422,
            error_code="VALIDATION_ERROR",
            message="Internal data validation error.",
            detail=str(exc),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception(
            "Unhandled exception",
            path=str(request.url),
            error=str(exc),
        )
        return _error_response(
            status_code=500,
            error_code="INTERNAL_ERROR",
            message="An unexpected internal error occurred.",
            detail=str(exc) if not app.state.settings.is_production else None,
        )
