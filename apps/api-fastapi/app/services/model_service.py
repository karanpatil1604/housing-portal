"""
Model service — application-level façade over ``HousingPriceModel``.

Responsibilities
----------------
* Lifecycle management (train-on-startup, lazy reload).
* Converting between Pydantic schemas and pandas DataFrames.
* Batch-size guard.
* Formatting currency strings.

This is the only module the HTTP handlers call; they are kept ignorant of
scikit-learn and pandas.
"""

from __future__ import annotations

import time
from typing import TYPE_CHECKING

import numpy as np
import pandas as pd

from app.core.config import Settings
from app.core.exceptions import BatchSizeLimitError, ModelNotTrainedError
from app.core.logging import get_logger
from app.models.housing_model import FEATURE_COLUMNS, HousingPriceModel
from app.schemas.model_info import FeatureImportance, ModelInfoResponse, ModelMetrics
from app.schemas.prediction import (
    BatchPredictRequest,
    BatchPredictResponse,
    HousingFeatures,
    PredictionResult,
    SinglePredictResponse,
)

if TYPE_CHECKING:
    pass

logger = get_logger(__name__)


class ModelService:
    """
    Singleton service that manages the lifecycle of ``HousingPriceModel``
    and provides high-level prediction methods to the API layer.
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._model: HousingPriceModel | None = None
        self._start_time = time.time()

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    def initialise(self) -> None:
        """
        Called once at application startup.

        Strategy:
        1. Try to load a persisted model from disk.
        2. If not found (or ``retrain_on_startup`` is True), train from CSV.
        3. Persist the freshly trained model.
        """
        model_path = self._settings.model_path

        if model_path.exists() and not self._settings.retrain_on_startup:
            logger.info("Loading persisted model", path=str(model_path))
            try:
                self._model = HousingPriceModel.load(model_path)
                return
            except Exception as exc:
                logger.warning(
                    "Failed to load persisted model — will retrain.",
                    error=str(exc),
                )

        logger.info("Training model from scratch")
        self._model = HousingPriceModel()
        self._model.train(self._settings.training_data_path)
        self._model.save(model_path)

    # ── Predictions ───────────────────────────────────────────────────────────

    def predict_single(self, features: HousingFeatures) -> SinglePredictResponse:
        """Return a prediction for a single property."""
        self._require_model()

        df = self._features_to_df([features])
        raw_preds: np.ndarray = self._model.predict(df)  # type: ignore[union-attr]
        price = float(raw_preds[0])

        return SinglePredictResponse(
            predicted_price=price,
            predicted_price_formatted=self._format_price(price),
            model_version=HousingPriceModel.VERSION,
            features_received=features,
        )

    def predict_batch(self, request: BatchPredictRequest) -> BatchPredictResponse:
        """Return predictions for a batch of properties."""
        self._require_model()

        if len(request.features) > self._settings.max_batch_size:
            raise BatchSizeLimitError(
                f"Batch size {len(request.features)} exceeds maximum of "
                f"{self._settings.max_batch_size}.",
            )

        df = self._features_to_df(request.features)
        raw_preds: np.ndarray = self._model.predict(df)  # type: ignore[union-attr]

        results = [
            PredictionResult(
                predicted_price=float(p),
                predicted_price_formatted=self._format_price(float(p)),
            )
            for p in raw_preds
        ]

        return BatchPredictResponse(
            count=len(results),
            predictions=results,
            model_version=HousingPriceModel.VERSION,
        )

    # ── Model info ────────────────────────────────────────────────────────────

    def get_model_info(self) -> ModelInfoResponse:
        """Return model coefficients and performance metrics."""
        if self._model is None or not self._model.is_trained:
            return ModelInfoResponse(
                model_name=self._settings.app_name,
                model_version=HousingPriceModel.VERSION,
                algorithm=HousingPriceModel.ALGORITHM,
                feature_names=FEATURE_COLUMNS,
                feature_importances=[],
                intercept=0.0,
                metrics=ModelMetrics(
                    r2_score=0.0,
                    mae=0.0,
                    rmse=0.0,
                    mape=0.0,
                    train_samples=0,
                    test_samples=0,
                ),
                training_data_path=str(self._settings.training_data_path),
                is_trained=False,
            )

        meta = self._model.metadata
        return ModelInfoResponse(
            model_name=self._settings.app_name,
            model_version=HousingPriceModel.VERSION,
            algorithm=HousingPriceModel.ALGORITHM,
            feature_names=meta.feature_names,
            feature_importances=[
                FeatureImportance(**fi) for fi in meta.feature_importances
            ],
            intercept=meta.intercept,
            metrics=ModelMetrics(
                r2_score=round(meta.r2, 4),
                mae=round(meta.mae, 2),
                rmse=round(meta.rmse, 2),
                mape=round(meta.mape, 2),
                train_samples=meta.train_samples,
                test_samples=meta.test_samples,
            ),
            training_data_path=str(self._settings.training_data_path),
            is_trained=True,
        )

    # ── Health helpers ────────────────────────────────────────────────────────

    @property
    def is_model_loaded(self) -> bool:
        return self._model is not None and self._model.is_trained

    @property
    def uptime_seconds(self) -> float:
        return round(time.time() - self._start_time, 2)

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _require_model(self) -> None:
        if not self.is_model_loaded:
            raise ModelNotTrainedError(
                "Model is not loaded. The service may still be initialising."
            )

    @staticmethod
    def _features_to_df(features_list: list[HousingFeatures]) -> pd.DataFrame:
        """Convert a list of Pydantic feature objects to a pandas DataFrame."""
        return pd.DataFrame([f.model_dump() for f in features_list])

    @staticmethod
    def _format_price(price: float) -> str:
        return f"${price:,.2f}"
