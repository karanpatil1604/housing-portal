"""
Model information endpoint.

GET /model-info — returns coefficients, feature importances, and evaluation metrics.
"""

from __future__ import annotations

from fastapi import APIRouter, status

from app.api.v1.dependencies import ModelServiceDep
from app.core.logging import get_logger
from app.schemas.model_info import ModelInfoResponse

logger = get_logger(__name__)

router = APIRouter(prefix="/model-info", tags=["Model"])


@router.get(
    "",
    response_model=ModelInfoResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve model metadata",
    description=(
        "Returns the trained model's algorithm, feature coefficients sorted by "
        "absolute importance, and performance metrics (R², MAE, RMSE, MAPE) "
        "computed on the held-out test split."
    ),
)
def get_model_info(service: ModelServiceDep) -> ModelInfoResponse:
    logger.info("Model info request received")
    return service.get_model_info()
