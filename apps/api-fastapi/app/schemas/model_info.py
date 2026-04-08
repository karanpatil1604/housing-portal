"""Schema for the /model-info endpoint."""

from __future__ import annotations

from pydantic import BaseModel, Field


class FeatureImportance(BaseModel):
    feature: str
    coefficient: float
    abs_importance: float


class ModelMetrics(BaseModel):
    r2_score: float = Field(description="Coefficient of determination on test split.")
    mae: float = Field(description="Mean Absolute Error in USD.")
    rmse: float = Field(description="Root Mean Squared Error in USD.")
    mape: float = Field(description="Mean Absolute Percentage Error (0–100).")
    train_samples: int
    test_samples: int


class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    algorithm: str
    feature_names: list[str]
    feature_importances: list[FeatureImportance]
    intercept: float
    metrics: ModelMetrics
    training_data_path: str
    is_trained: bool
