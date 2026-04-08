"""
API v1 router.

All v1 endpoint routers are registered here.  Adding a new resource
is a one-liner: import the router and call ``include_router``.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.model_info import router as model_info_router
from app.api.v1.endpoints.predict import router as predict_router

v1_router = APIRouter()

v1_router.include_router(health_router)
v1_router.include_router(predict_router)
v1_router.include_router(model_info_router)
