"""
Unit tests for Pydantic request / response schemas.
"""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.prediction import (
    BatchPredictRequest,
    HousingFeatures,
    SinglePredictRequest,
)

VALID_FEATURES = {
    "square_footage": 1850,
    "bedrooms": 3,
    "bathrooms": 2.0,
    "year_built": 2005,
    "lot_size": 6500,
    "distance_to_city_center": 4.5,
    "school_rating": 8.2,
}


class TestHousingFeaturesSchema:
    def test_valid_features_accepted(self) -> None:
        f = HousingFeatures(**VALID_FEATURES)
        assert f.square_footage == 1850

    def test_missing_field_raises(self) -> None:
        incomplete = {k: v for k, v in VALID_FEATURES.items() if k != "bedrooms"}
        with pytest.raises(ValidationError):
            HousingFeatures(**incomplete)

    def test_negative_square_footage_raises(self) -> None:
        with pytest.raises(ValidationError):
            HousingFeatures(**{**VALID_FEATURES, "square_footage": -100})

    def test_school_rating_above_10_raises(self) -> None:
        with pytest.raises(ValidationError):
            HousingFeatures(**{**VALID_FEATURES, "school_rating": 11.0})

    def test_zero_square_footage_raises(self) -> None:
        with pytest.raises(ValidationError):
            HousingFeatures(**{**VALID_FEATURES, "square_footage": 0})

    def test_unrealistic_bathrooms_raises(self) -> None:
        """More than bedrooms + 3 bathrooms should fail the cross-field validator."""
        with pytest.raises(ValidationError):
            HousingFeatures(**{**VALID_FEATURES, "bedrooms": 1, "bathrooms": 10.0})

    def test_year_built_out_of_range_raises(self) -> None:
        with pytest.raises(ValidationError):
            HousingFeatures(**{**VALID_FEATURES, "year_built": 1700})

    def test_float_bathrooms_accepted(self) -> None:
        f = HousingFeatures(**{**VALID_FEATURES, "bathrooms": 2.5})
        assert f.bathrooms == 2.5


class TestSinglePredictRequest:
    def test_valid_request_accepted(self) -> None:
        req = SinglePredictRequest(features=VALID_FEATURES)
        assert req.features.square_footage == 1850

    def test_missing_features_raises(self) -> None:
        with pytest.raises(ValidationError):
            SinglePredictRequest(features={})


class TestBatchPredictRequest:
    def test_valid_batch_accepted(self) -> None:
        req = BatchPredictRequest(features=[VALID_FEATURES, VALID_FEATURES])
        assert len(req.features) == 2

    def test_empty_batch_raises(self) -> None:
        with pytest.raises(ValidationError):
            BatchPredictRequest(features=[])

    def test_single_item_batch_accepted(self) -> None:
        req = BatchPredictRequest(features=[VALID_FEATURES])
        assert len(req.features) == 1
