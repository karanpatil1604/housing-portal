"""
Pydantic schemas for prediction request / response payloads.

These are the public API contract.  Change them carefully — any field
rename or type change is a breaking change for API consumers.
"""

from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, Field, model_validator


# ── Shared feature field definitions ──────────────────────────────────────────

_SQUARE_FOOTAGE = Annotated[
    int, Field(gt=0, le=50_000, description="Total liveable area in square feet.")
]
_BEDROOMS = Annotated[
    int, Field(ge=0, le=20, description="Number of bedrooms.")
]
_BATHROOMS = Annotated[
    float, Field(ge=0.0, le=20.0, description="Number of bathrooms (0.5 increments).")
]
_YEAR_BUILT = Annotated[
    int, Field(ge=1800, le=2100, description="Year the property was constructed.")
]
_LOT_SIZE = Annotated[
    int, Field(gt=0, le=5_000_000, description="Lot area in square feet.")
]
_DISTANCE_TO_CITY_CENTER = Annotated[
    float, Field(ge=0.0, le=500.0, description="Distance to city centre in miles.")
]
_SCHOOL_RATING = Annotated[
    float, Field(ge=0.0, le=10.0, description="Nearest school quality rating (0–10).")
]


# ── Request schemas ───────────────────────────────────────────────────────────


class HousingFeatures(BaseModel):
    """Feature vector for a single property."""

    square_footage: _SQUARE_FOOTAGE
    bedrooms: _BEDROOMS
    bathrooms: _BATHROOMS
    year_built: _YEAR_BUILT
    lot_size: _LOT_SIZE
    distance_to_city_center: _DISTANCE_TO_CITY_CENTER
    school_rating: _SCHOOL_RATING

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "square_footage": 1850,
                    "bedrooms": 3,
                    "bathrooms": 2.0,
                    "year_built": 2005,
                    "lot_size": 6500,
                    "distance_to_city_center": 4.5,
                    "school_rating": 8.2,
                }
            ]
        }
    }

    @model_validator(mode="after")
    def bathrooms_not_exceed_bedrooms(self) -> HousingFeatures:
        """Soft sanity-check: bathrooms shouldn't outnumber bedrooms by >3."""
        if self.bedrooms > 0 and self.bathrooms > self.bedrooms + 3:
            raise ValueError(
                f"bathrooms ({self.bathrooms}) seems unrealistically high "
                f"relative to bedrooms ({self.bedrooms})."
            )
        return self


class SinglePredictRequest(BaseModel):
    """Wrapper for a single-house prediction request."""

    features: HousingFeatures


class BatchPredictRequest(BaseModel):
    """Wrapper for a batch prediction request (list of houses)."""

    features: list[HousingFeatures] = Field(
        min_length=1, description="One or more feature vectors."
    )


# ── Response schemas ──────────────────────────────────────────────────────────


class PredictionResult(BaseModel):
    """Single prediction result."""

    predicted_price: float = Field(description="Predicted property price in USD.")
    predicted_price_formatted: str = Field(
        description="Human-readable price string, e.g. '$265,432.00'."
    )


class SinglePredictResponse(PredictionResult):
    """Response for a single-house prediction."""

    model_version: str
    features_received: HousingFeatures


class BatchPredictResponse(BaseModel):
    """Response for a batch prediction."""

    count: int
    predictions: list[PredictionResult]
    model_version: str


# ── Error schema ──────────────────────────────────────────────────────────────


class ErrorResponse(BaseModel):
    """Standardised error envelope."""

    error_code: str
    message: str
    detail: str | None = None
