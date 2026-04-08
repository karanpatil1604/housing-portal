"""Integration tests for GET /api/v1/model-info."""

from __future__ import annotations

from fastapi.testclient import TestClient


class TestModelInfoEndpoint:
    def test_model_info_returns_200(self, test_client: TestClient) -> None:
        response = test_client.get("/api/v1/model-info")
        assert response.status_code == 200

    def test_model_info_response_schema(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/model-info").json()
        required_keys = {
            "model_name",
            "model_version",
            "algorithm",
            "feature_names",
            "feature_importances",
            "intercept",
            "metrics",
            "training_data_path",
            "is_trained",
        }
        assert required_keys.issubset(data.keys())

    def test_model_is_trained(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/model-info").json()
        assert data["is_trained"] is True

    def test_feature_names_are_correct(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/model-info").json()
        expected = [
            "square_footage",
            "bedrooms",
            "bathrooms",
            "year_built",
            "lot_size",
            "distance_to_city_center",
            "school_rating",
        ]
        assert data["feature_names"] == expected

    def test_feature_importances_count_matches_features(
        self, test_client: TestClient
    ) -> None:
        data = test_client.get("/api/v1/model-info").json()
        assert len(data["feature_importances"]) == len(data["feature_names"])

    def test_feature_importance_schema(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/model-info").json()
        for fi in data["feature_importances"]:
            assert "feature" in fi
            assert "coefficient" in fi
            assert "abs_importance" in fi
            assert fi["abs_importance"] >= 0

    def test_metrics_schema(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/model-info").json()
        metrics = data["metrics"]
        assert "r2_score" in metrics
        assert "mae" in metrics
        assert "rmse" in metrics
        assert "mape" in metrics
        assert "train_samples" in metrics
        assert "test_samples" in metrics

    def test_r2_score_is_positive(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/model-info").json()
        assert data["metrics"]["r2_score"] > 0

    def test_mae_is_positive(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/model-info").json()
        assert data["metrics"]["mae"] > 0

    def test_rmse_is_positive(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/model-info").json()
        assert data["metrics"]["rmse"] > 0

    def test_train_samples_plus_test_samples_equals_total(
        self, test_client: TestClient
    ) -> None:
        data = test_client.get("/api/v1/model-info").json()
        metrics = data["metrics"]
        assert metrics["train_samples"] + metrics["test_samples"] == 50

    def test_algorithm_field_is_non_empty_string(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/model-info").json()
        assert isinstance(data["algorithm"], str)
        assert len(data["algorithm"]) > 0

    def test_intercept_is_float(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/model-info").json()
        assert isinstance(data["intercept"], float)
