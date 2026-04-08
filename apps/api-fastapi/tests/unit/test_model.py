"""
Unit tests for ``HousingPriceModel``.

These tests exercise the ML wrapper in isolation — no HTTP layer involved.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import pytest

from app.core.exceptions import (
    ModelLoadError,
    ModelNotTrainedError,
    TrainingDataNotFoundError,
)
from app.models.housing_model import FEATURE_COLUMNS, HousingPriceModel


# ── Training ──────────────────────────────────────────────────────────────────


class TestModelTraining:
    def test_train_succeeds_with_valid_data(self, trained_model: HousingPriceModel) -> None:
        assert trained_model.is_trained

    def test_train_populates_metadata(self, trained_model: HousingPriceModel) -> None:
        meta = trained_model.metadata
        assert meta.feature_names == FEATURE_COLUMNS
        assert len(meta.coefficients) == len(FEATURE_COLUMNS)
        assert isinstance(meta.intercept, float)

    def test_train_produces_positive_r2(self, trained_model: HousingPriceModel) -> None:
        """R² should be meaningfully positive on this dataset."""
        assert trained_model.metadata.r2 > 0.5

    def test_train_produces_positive_mae(self, trained_model: HousingPriceModel) -> None:
        assert trained_model.metadata.mae > 0

    def test_train_produces_positive_rmse(self, trained_model: HousingPriceModel) -> None:
        assert trained_model.metadata.rmse > 0

    def test_train_raises_on_missing_file(self, tmp_path: Path) -> None:
        model = HousingPriceModel()
        with pytest.raises(TrainingDataNotFoundError):
            model.train(tmp_path / "nonexistent.csv")

    def test_train_sets_train_test_sample_counts(self, trained_model: HousingPriceModel) -> None:
        meta = trained_model.metadata
        assert meta.train_samples > 0
        assert meta.test_samples > 0
        assert meta.train_samples + meta.test_samples == 50  # total rows in dataset


# ── Prediction ────────────────────────────────────────────────────────────────


class TestModelPrediction:
    def test_predict_returns_array(self, trained_model: HousingPriceModel) -> None:
        df = pd.DataFrame(
            [
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
        )
        result = trained_model.predict(df)
        assert isinstance(result, np.ndarray)
        assert result.shape == (1,)

    def test_predict_returns_positive_price(self, trained_model: HousingPriceModel) -> None:
        df = pd.DataFrame(
            [
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
        )
        price = trained_model.predict(df)[0]
        assert price > 0

    def test_predict_batch_returns_multiple_results(self, trained_model: HousingPriceModel) -> None:
        rows = [
            {
                "square_footage": sq,
                "bedrooms": 3,
                "bathrooms": 2.0,
                "year_built": 2005,
                "lot_size": 6500,
                "distance_to_city_center": 4.5,
                "school_rating": 8.0,
            }
            for sq in [1200, 1800, 2400]
        ]
        df = pd.DataFrame(rows)
        result = trained_model.predict(df)
        assert len(result) == 3

    def test_larger_house_predicts_higher_price(self, trained_model: HousingPriceModel) -> None:
        """Sanity-check: bigger square footage → higher predicted price."""
        base = {
            "bedrooms": 3,
            "bathrooms": 2.0,
            "year_built": 2005,
            "lot_size": 6500,
            "distance_to_city_center": 4.5,
            "school_rating": 8.0,
        }
        small = pd.DataFrame([{**base, "square_footage": 1000}])
        large = pd.DataFrame([{**base, "square_footage": 3000}])
        assert trained_model.predict(large)[0] > trained_model.predict(small)[0]

    def test_predict_raises_when_not_trained(self) -> None:
        model = HousingPriceModel()
        df = pd.DataFrame([{"square_footage": 1000, "bedrooms": 2, "bathrooms": 1.0,
                             "year_built": 2000, "lot_size": 5000,
                             "distance_to_city_center": 3.0, "school_rating": 7.0}])
        with pytest.raises(ModelNotTrainedError):
            model.predict(df)


# ── Persistence ───────────────────────────────────────────────────────────────


class TestModelPersistence:
    def test_save_and_load_roundtrip(
        self, trained_model: HousingPriceModel, tmp_path: Path
    ) -> None:
        save_path = tmp_path / "model.joblib"
        trained_model.save(save_path)
        assert save_path.exists()

        loaded = HousingPriceModel.load(save_path)
        assert loaded.is_trained
        assert loaded.metadata.r2 == trained_model.metadata.r2

    def test_load_raises_on_missing_file(self, tmp_path: Path) -> None:
        with pytest.raises(ModelLoadError):
            HousingPriceModel.load(tmp_path / "ghost.joblib")

    def test_save_raises_when_not_trained(self, tmp_path: Path) -> None:
        model = HousingPriceModel()
        with pytest.raises(ModelNotTrainedError):
            model.save(tmp_path / "model.joblib")

    def test_loaded_model_predictions_match_original(
        self, trained_model: HousingPriceModel, tmp_path: Path
    ) -> None:
        save_path = tmp_path / "model.joblib"
        trained_model.save(save_path)
        loaded = HousingPriceModel.load(save_path)

        df = pd.DataFrame(
            [
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
        )
        original_pred = trained_model.predict(df)[0]
        loaded_pred = loaded.predict(df)[0]
        assert abs(original_pred - loaded_pred) < 0.01


# ── Feature importances ───────────────────────────────────────────────────────


class TestFeatureImportances:
    def test_feature_importances_have_correct_keys(self, trained_model: HousingPriceModel) -> None:
        for fi in trained_model.metadata.feature_importances:
            assert "feature" in fi
            assert "coefficient" in fi
            assert "abs_importance" in fi

    def test_abs_importance_is_non_negative(self, trained_model: HousingPriceModel) -> None:
        for fi in trained_model.metadata.feature_importances:
            assert fi["abs_importance"] >= 0
