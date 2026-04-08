"""
Centralised application configuration.

All settings can be overridden via environment variables or a .env file.
Pydantic-settings validates types at startup so misconfiguration fails fast.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings resolved from env / .env / defaults."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    app_name: str = "Housing Price Prediction API"
    app_version: str = "1.0.0"
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = False

    # ── API ───────────────────────────────────────────────────────────────────
    api_v1_prefix: str = "/api/v1"
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 1

    # ── Model ─────────────────────────────────────────────────────────────────
    model_dir: Path = Path("models")
    model_filename: str = "housing_price_model.joblib"
    training_data_path: Path = Path("data/House_Price_Dataset.csv")
    retrain_on_startup: bool = Field(
        default=True,
        description="Train model from scratch if no persisted artefact is found.",
    )

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    log_format: Literal["json", "console"] = "console"

    # ── Batch limits ──────────────────────────────────────────────────────────
    max_batch_size: int = Field(default=500, ge=1, le=10_000)

    @field_validator("model_dir", mode="before")
    @classmethod
    def ensure_model_dir(cls, v: str | Path) -> Path:
        path = Path(v)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def model_path(self) -> Path:
        return self.model_dir / self.model_filename

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the cached singleton settings instance."""
    return Settings()
