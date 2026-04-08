"""
Shared pytest fixtures.

Design philosophy
-----------------
* ``app_settings`` overrides the model and data dirs to temp directories
  so tests never pollute the repository tree.
* ``test_client`` creates a fresh application per test session via
  ``create_app``, keeping tests hermetically isolated.
* ``trained_model`` is session-scoped because training is expensive
  (even on this tiny dataset) — reuse the artefact across all unit tests.
"""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app
from app.models.housing_model import HousingPriceModel

# Path to the real training data shipped with the project
TRAINING_DATA = Path(__file__).parent.parent / "data" / "House_Price_Dataset.csv"


@pytest.fixture(scope="session")
def tmp_model_dir(tmp_path_factory: pytest.TempPathFactory) -> Path:
    """Session-scoped temp directory for model artefacts."""
    return tmp_path_factory.mktemp("models")


@pytest.fixture(scope="session")
def app_settings(tmp_model_dir: Path) -> Settings:
    """Settings instance pointing at test dirs."""
    return Settings(
        environment="development",
        debug=True,
        log_level="DEBUG",
        model_dir=tmp_model_dir,
        training_data_path=TRAINING_DATA,
        retrain_on_startup=True,
        max_batch_size=50,
    )


@pytest.fixture(scope="session")
def test_client(app_settings: Settings) -> TestClient:
    """Session-scoped FastAPI test client."""
    application = create_app(settings=app_settings)
    with TestClient(application, raise_server_exceptions=False) as client:
        yield client


@pytest.fixture(scope="session")
def trained_model(tmp_model_dir: Path) -> HousingPriceModel:
    """Session-scoped trained model artefact."""
    model = HousingPriceModel()
    model.train(TRAINING_DATA)
    return model


@pytest.fixture
def valid_features() -> dict:
    """A valid, realistic feature payload."""
    return {
        "square_footage": 1850,
        "bedrooms": 3,
        "bathrooms": 2.0,
        "year_built": 2005,
        "lot_size": 6500,
        "distance_to_city_center": 4.5,
        "school_rating": 8.2,
    }


@pytest.fixture
def valid_single_request(valid_features: dict) -> dict:
    return {"features": valid_features}


@pytest.fixture
def valid_batch_request(valid_features: dict) -> dict:
    return {"features": [valid_features, {**valid_features, "bedrooms": 4, "square_footage": 2200}]}
