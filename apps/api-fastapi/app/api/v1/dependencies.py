"""
FastAPI dependency providers.

Using ``Annotated`` + ``Depends`` keeps handler signatures clean and makes
the service injectable (and mockable) in tests.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Request

from app.services.model_service import ModelService


def get_model_service(request: Request) -> ModelService:
    """Extract the ``ModelService`` singleton from app state."""
    return request.app.state.model_service


ModelServiceDep = Annotated[ModelService, Depends(get_model_service)]
