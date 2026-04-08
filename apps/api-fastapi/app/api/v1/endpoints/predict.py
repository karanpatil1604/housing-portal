"""
Prediction endpoints.

POST /predict        — single property
POST /predict/batch  — list of properties
"""

from __future__ import annotations

from fastapi import APIRouter, status

from app.api.v1.dependencies import ModelServiceDep
from app.core.logging import get_logger
from app.schemas.prediction import (
    BatchPredictRequest,
    BatchPredictResponse,
    SinglePredictRequest,
    SinglePredictResponse,
)

logger = get_logger(__name__)

router = APIRouter(prefix="/predict", tags=["Predictions"])


@router.post(
    "",
    response_model=SinglePredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict price for a single property",
    description=(
        "Accepts a single property's feature vector and returns a predicted "
        "sale price in USD together with the model version used."
    ),
)
def predict_single(
    body: SinglePredictRequest,
    service: ModelServiceDep,
) -> SinglePredictResponse:
    logger.info("Single prediction request received")
    result = service.predict_single(body.features)
    logger.info(
        "Single prediction complete",
        predicted_price=result.predicted_price,
    )
    return result


@router.post(
    "/batch",
    response_model=BatchPredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict prices for multiple properties",
    description=(
        "Accepts a list of property feature vectors (up to the configured "
        "``max_batch_size``) and returns a prediction for each."
    ),
)
def predict_batch(
    body: BatchPredictRequest,
    service: ModelServiceDep,
) -> BatchPredictResponse:
    logger.info("Batch prediction request received", count=len(body.features))
    result = service.predict_batch(body)
    logger.info("Batch prediction complete", count=result.count)
    return result
