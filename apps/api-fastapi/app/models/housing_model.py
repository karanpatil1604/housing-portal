"""
Housing price regression model.

The ``HousingPriceModel`` class wraps scikit-learn's pipeline and exposes a
stable interface consumed by the service layer.  All ML logic lives here so
it can be swapped (e.g. Gradient Boosting, Neural Net) without touching the
API layer.

Design decisions
----------------
* ``Pipeline`` (StandardScaler → LinearRegression) prevents data leakage
  — the scaler is fitted on training data only and applied consistently at
  inference time.
* ``train_test_split`` with a fixed ``random_state`` gives reproducible
  metrics across restarts.
* Model artefact is persisted with ``joblib`` (joblib compresses arrays more
  efficiently than pickle).
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import TYPE_CHECKING

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.core.exceptions import (
    ModelLoadError,
    ModelNotTrainedError,
    ModelTrainingError,
    TrainingDataNotFoundError,
)
from app.core.logging import get_logger

if TYPE_CHECKING:
    pass

logger = get_logger(__name__)

# Feature columns in the order the model expects
FEATURE_COLUMNS: list[str] = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]
TARGET_COLUMN = "price"
RANDOM_STATE = 42
TEST_SIZE = 0.2


@dataclass
class ModelMetadata:
    """Holds coefficients, intercept, and evaluation metrics post-training."""

    feature_names: list[str]
    coefficients: list[float]
    intercept: float
    r2: float
    mae: float
    rmse: float
    mape: float
    train_samples: int
    test_samples: int
    trained_at: float = field(default_factory=time.time)

    @property
    def feature_importances(self) -> list[dict[str, float]]:
        return [
            {
                "feature": name,
                "coefficient": coef,
                "abs_importance": abs(coef),
            }
            for name, coef in zip(self.feature_names, self.coefficients)
        ]


class HousingPriceModel:
    """
    Thin wrapper around a scikit-learn Pipeline for housing price regression.

    Usage::

        model = HousingPriceModel()
        model.train(Path("data/House_Price_Dataset.csv"))
        predictions = model.predict(features_df)
        model.save(Path("models/housing_price_model.joblib"))

        # Later, in another process:
        model2 = HousingPriceModel.load(Path("models/housing_price_model.joblib"))
    """

    VERSION = "1.0.0"
    ALGORITHM = "Ridge Regression (StandardScaler pipeline)"

    def __init__(self) -> None:
        self._pipeline: Pipeline | None = None
        self._metadata: ModelMetadata | None = None

    # ── Properties ────────────────────────────────────────────────────────────

    @property
    def is_trained(self) -> bool:
        return self._pipeline is not None and self._metadata is not None

    @property
    def metadata(self) -> ModelMetadata:
        if self._metadata is None:
            raise ModelNotTrainedError("Model has not been trained yet.")
        return self._metadata

    # ── Training ──────────────────────────────────────────────────────────────

    def train(self, data_path: Path) -> ModelMetadata:
        """
        Train the model from a CSV file and populate metadata.

        Args:
            data_path: Path to the training CSV.

        Returns:
            Populated ``ModelMetadata`` with metrics.

        Raises:
            TrainingDataNotFoundError: If *data_path* does not exist.
            ModelTrainingError:        On any training failure.
        """
        if not data_path.exists():
            raise TrainingDataNotFoundError(
                f"Training data not found at '{data_path}'.",
                detail=f"Ensure the CSV is present at: {data_path.resolve()}",
            )

        logger.info("Starting model training", data_path=str(data_path))
        t0 = time.perf_counter()

        try:
            df = pd.read_csv(data_path)
            logger.debug("Loaded dataset", rows=len(df), columns=list(df.columns))

            X = df[FEATURE_COLUMNS]
            y = df[TARGET_COLUMN]

            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
            )

            pipeline = Pipeline(
                [
                    ("scaler", StandardScaler()),
                    ("regressor", Ridge(alpha=1.0)),
                ]
            )
            pipeline.fit(X_train, y_train)

            y_pred = pipeline.predict(X_test)

            # Metrics
            r2 = float(r2_score(y_test, y_pred))
            mae = float(mean_absolute_error(y_test, y_pred))
            rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
            nonzero_mask = y_test != 0
            mape = float(
                np.mean(np.abs((y_test[nonzero_mask] - y_pred[nonzero_mask]) / y_test[nonzero_mask]))
                * 100
            )

            # Extract coefficients from the Ridge step
            regressor: Ridge = pipeline.named_steps["regressor"]
            coefficients = regressor.coef_.tolist()
            intercept = float(regressor.intercept_)

            self._pipeline = pipeline
            self._metadata = ModelMetadata(
                feature_names=FEATURE_COLUMNS,
                coefficients=coefficients,
                intercept=intercept,
                r2=r2,
                mae=mae,
                rmse=rmse,
                mape=mape,
                train_samples=len(X_train),
                test_samples=len(X_test),
            )

            elapsed = time.perf_counter() - t0
            logger.info(
                "Model training complete",
                r2=round(r2, 4),
                mae=round(mae, 2),
                rmse=round(rmse, 2),
                mape=round(mape, 2),
                elapsed_seconds=round(elapsed, 3),
            )
            return self._metadata

        except (TrainingDataNotFoundError, ModelNotTrainedError):
            raise
        except Exception as exc:
            logger.exception("Model training failed", error=str(exc))
            raise ModelTrainingError(
                "Training failed unexpectedly.", detail=str(exc)
            ) from exc

    # ── Inference ─────────────────────────────────────────────────────────────

    def predict(self, features: pd.DataFrame) -> np.ndarray:
        """
        Return predicted prices for one or more feature rows.

        Args:
            features: DataFrame with exactly the columns in ``FEATURE_COLUMNS``.

        Returns:
            1-D numpy array of predicted prices.

        Raises:
            ModelNotTrainedError: If the model has not been trained.
        """
        if not self.is_trained:
            raise ModelNotTrainedError("Cannot predict — model is not trained.")

        missing = set(FEATURE_COLUMNS) - set(features.columns)
        if missing:
            raise ValueError(f"Missing feature columns: {missing}")

        # Ensure correct column order
        X = features[FEATURE_COLUMNS]
        predictions: np.ndarray = self._pipeline.predict(X)  # type: ignore[union-attr]
        logger.debug("Prediction made", n=len(predictions))
        return predictions

    # ── Persistence ───────────────────────────────────────────────────────────

    def save(self, path: Path) -> None:
        """Serialise the pipeline and metadata to *path* using joblib."""
        if not self.is_trained:
            raise ModelNotTrainedError("Cannot save — model is not trained.")

        path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump({"pipeline": self._pipeline, "metadata": self._metadata}, path)
        logger.info("Model saved", path=str(path))

    @classmethod
    def load(cls, path: Path) -> HousingPriceModel:
        """
        Deserialise a previously saved model artefact.

        Args:
            path: Path to the ``.joblib`` file.

        Returns:
            A fully-initialised ``HousingPriceModel`` ready for inference.

        Raises:
            ModelLoadError: If the file is missing or corrupt.
        """
        if not path.exists():
            raise ModelLoadError(
                f"Model file not found at '{path}'.",
                detail="Train the model first or check the MODEL_DIR setting.",
            )

        try:
            artefact = joblib.load(path)
            instance = cls()
            instance._pipeline = artefact["pipeline"]
            instance._metadata = artefact["metadata"]
            logger.info("Model loaded", path=str(path), r2=round(instance._metadata.r2, 4))
            return instance
        except (KeyError, TypeError, ValueError) as exc:
            logger.exception("Model load failed", path=str(path))
            raise ModelLoadError(
                f"Model artefact at '{path}' is corrupt or incompatible.",
                detail=str(exc),
            ) from exc
