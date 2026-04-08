"""
Request / response logging middleware.

Logs every inbound request and outbound response with timing, so you get
a full audit trail without any per-endpoint boilerplate.
"""

from __future__ import annotations

import time
import uuid

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.core.logging import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every HTTP request with timing and a correlation ID."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        correlation_id = str(uuid.uuid4())
        start = time.perf_counter()

        logger.info(
            "Request started",
            method=request.method,
            path=request.url.path,
            correlation_id=correlation_id,
            client=request.client.host if request.client else "unknown",
        )

        try:
            response = await call_next(request)
        except Exception:
            elapsed = round((time.perf_counter() - start) * 1000, 2)
            logger.exception(
                "Request failed with unhandled exception",
                method=request.method,
                path=request.url.path,
                correlation_id=correlation_id,
                elapsed_ms=elapsed,
            )
            raise

        elapsed = round((time.perf_counter() - start) * 1000, 2)
        logger.info(
            "Request completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            correlation_id=correlation_id,
            elapsed_ms=elapsed,
        )

        # Propagate correlation ID to the client for distributed tracing
        response.headers["X-Correlation-ID"] = correlation_id
        return response
