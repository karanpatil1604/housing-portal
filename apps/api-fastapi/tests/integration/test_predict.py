"""
Integration tests for prediction endpoints.

POST /api/v1/predict
POST /api/v1/predict/batch
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


class TestSinglePredict:
    def test_single_predict_returns_200(
        self, test_client: TestClient, valid_single_request: dict
    ) -> None:
        response = test_client.post("/api/v1/predict", json=valid_single_request)
        assert response.status_code == 200

    def test_single_predict_response_schema(
        self, test_client: TestClient, valid_single_request: dict
    ) -> None:
        data = test_client.post("/api/v1/predict", json=valid_single_request).json()
        assert "predicted_price" in data
        assert "predicted_price_formatted" in data
        assert "model_version" in data
        assert "features_received" in data

    def test_single_predict_price_is_positive(
        self, test_client: TestClient, valid_single_request: dict
    ) -> None:
        data = test_client.post("/api/v1/predict", json=valid_single_request).json()
        assert data["predicted_price"] > 0

    def test_single_predict_formatted_price_starts_with_dollar(
        self, test_client: TestClient, valid_single_request: dict
    ) -> None:
        data = test_client.post("/api/v1/predict", json=valid_single_request).json()
        assert data["predicted_price_formatted"].startswith("$")

    def test_single_predict_features_echoed_back(
        self, test_client: TestClient, valid_features: dict, valid_single_request: dict
    ) -> None:
        data = test_client.post("/api/v1/predict", json=valid_single_request).json()
        echoed = data["features_received"]
        assert echoed["square_footage"] == valid_features["square_footage"]
        assert echoed["bedrooms"] == valid_features["bedrooms"]

    def test_single_predict_missing_feature_returns_422(
        self, test_client: TestClient, valid_features: dict
    ) -> None:
        incomplete = {k: v for k, v in valid_features.items() if k != "bedrooms"}
        response = test_client.post("/api/v1/predict", json={"features": incomplete})
        assert response.status_code == 422

    def test_single_predict_invalid_school_rating_returns_422(
        self, test_client: TestClient, valid_features: dict
    ) -> None:
        bad = {**valid_features, "school_rating": 15.0}
        response = test_client.post("/api/v1/predict", json={"features": bad})
        assert response.status_code == 422

    def test_single_predict_negative_square_footage_returns_422(
        self, test_client: TestClient, valid_features: dict
    ) -> None:
        bad = {**valid_features, "square_footage": -500}
        response = test_client.post("/api/v1/predict", json={"features": bad})
        assert response.status_code == 422

    def test_single_predict_empty_body_returns_422(
        self, test_client: TestClient
    ) -> None:
        response = test_client.post("/api/v1/predict", json={})
        assert response.status_code == 422

    def test_single_predict_larger_house_gives_higher_price(
        self, test_client: TestClient, valid_features: dict
    ) -> None:
        small = {**valid_features, "square_footage": 900}
        large = {**valid_features, "square_footage": 3500}
        price_small = test_client.post("/api/v1/predict", json={"features": small}).json()[
            "predicted_price"
        ]
        price_large = test_client.post("/api/v1/predict", json={"features": large}).json()[
            "predicted_price"
        ]
        assert price_large > price_small

    def test_single_predict_model_version_is_string(
        self, test_client: TestClient, valid_single_request: dict
    ) -> None:
        data = test_client.post("/api/v1/predict", json=valid_single_request).json()
        assert isinstance(data["model_version"], str)
        assert len(data["model_version"]) > 0

    def test_single_predict_error_response_has_error_code(
        self, test_client: TestClient, valid_features: dict
    ) -> None:
        bad = {**valid_features, "square_footage": 0}
        data = test_client.post("/api/v1/predict", json={"features": bad}).json()
        assert "error_code" in data
        assert "message" in data


class TestBatchPredict:
    def test_batch_predict_returns_200(
        self, test_client: TestClient, valid_batch_request: dict
    ) -> None:
        response = test_client.post("/api/v1/predict/batch", json=valid_batch_request)
        assert response.status_code == 200

    def test_batch_predict_response_schema(
        self, test_client: TestClient, valid_batch_request: dict
    ) -> None:
        data = test_client.post("/api/v1/predict/batch", json=valid_batch_request).json()
        assert "count" in data
        assert "predictions" in data
        assert "model_version" in data

    def test_batch_predict_count_matches_input(
        self, test_client: TestClient, valid_batch_request: dict
    ) -> None:
        n = len(valid_batch_request["features"])
        data = test_client.post("/api/v1/predict/batch", json=valid_batch_request).json()
        assert data["count"] == n
        assert len(data["predictions"]) == n

    def test_batch_predict_all_prices_positive(
        self, test_client: TestClient, valid_batch_request: dict
    ) -> None:
        data = test_client.post("/api/v1/predict/batch", json=valid_batch_request).json()
        for pred in data["predictions"]:
            assert pred["predicted_price"] > 0

    def test_batch_predict_single_item(
        self, test_client: TestClient, valid_features: dict
    ) -> None:
        response = test_client.post(
            "/api/v1/predict/batch", json={"features": [valid_features]}
        )
        assert response.status_code == 200
        assert response.json()["count"] == 1

    def test_batch_predict_empty_list_returns_422(
        self, test_client: TestClient
    ) -> None:
        response = test_client.post("/api/v1/predict/batch", json={"features": []})
        assert response.status_code == 422

    def test_batch_predict_exceeds_max_size_returns_413(
        self, test_client: TestClient, valid_features: dict
    ) -> None:
        # app_settings sets max_batch_size=50; send 51
        payload = {"features": [valid_features] * 51}
        response = test_client.post("/api/v1/predict/batch", json=payload)
        assert response.status_code == 413

    def test_batch_predict_formatted_prices_have_dollar_sign(
        self, test_client: TestClient, valid_batch_request: dict
    ) -> None:
        data = test_client.post("/api/v1/predict/batch", json=valid_batch_request).json()
        for pred in data["predictions"]:
            assert pred["predicted_price_formatted"].startswith("$")

    def test_batch_predict_five_houses(
        self, test_client: TestClient, valid_features: dict
    ) -> None:
        """Larger batch still returns correct count."""
        houses = [
            {**valid_features, "square_footage": 1000 + (i * 200), "bedrooms": 2 + (i % 3)}
            for i in range(5)
        ]
        data = test_client.post("/api/v1/predict/batch", json={"features": houses}).json()
        assert data["count"] == 5

    def test_batch_predict_one_invalid_item_returns_422(
        self, test_client: TestClient, valid_features: dict
    ) -> None:
        bad_item = {**valid_features, "school_rating": 99.0}
        payload = {"features": [valid_features, bad_item]}
        response = test_client.post("/api/v1/predict/batch", json=payload)
        assert response.status_code == 422

    @pytest.mark.parametrize("n", [1, 5, 10, 20])
    def test_batch_predict_various_sizes(
        self, test_client: TestClient, valid_features: dict, n: int
    ) -> None:
        payload = {"features": [valid_features] * n}
        data = test_client.post("/api/v1/predict/batch", json=payload).json()
        assert data["count"] == n
