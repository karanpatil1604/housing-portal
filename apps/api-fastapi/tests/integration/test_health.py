"""Integration tests for GET /api/v1/health."""

from __future__ import annotations

from fastapi.testclient import TestClient


class TestHealthEndpoint:
    def test_health_returns_200(self, test_client: TestClient) -> None:
        response = test_client.get("/api/v1/health")
        assert response.status_code == 200

    def test_health_response_schema(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/health").json()
        assert "status" in data
        assert "version" in data
        assert "model_loaded" in data
        assert "uptime_seconds" in data
        assert "environment" in data

    def test_health_status_is_healthy_after_startup(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/health").json()
        assert data["status"] == "healthy"

    def test_health_model_loaded_is_true(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/health").json()
        assert data["model_loaded"] is True

    def test_health_uptime_is_positive(self, test_client: TestClient) -> None:
        data = test_client.get("/api/v1/health").json()
        assert data["uptime_seconds"] >= 0
