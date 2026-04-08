#!/usr/bin/env python3
"""
Standalone model training CLI.

Usage
-----
    python scripts/train_model.py
    python scripts/train_model.py --data data/House_Price_Dataset.csv --out models/housing_price_model.joblib

This script is useful for:
  * Pre-training the model before building a Docker image (so the first
    request isn't slow).
  * CI/CD pipelines that want to verify training succeeds before deploying.
  * Offline experimentation.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Make sure the project root is on sys.path when called from any working directory
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.core.logging import configure_logging, get_logger
from app.models.housing_model import HousingPriceModel

configure_logging(log_level="INFO", log_format="console")
logger = get_logger("train_script")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train the housing price regression model.")
    parser.add_argument(
        "--data",
        type=Path,
        default=ROOT / "data" / "House_Price_Dataset.csv",
        help="Path to the training CSV file.",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=ROOT / "models" / "housing_price_model.joblib",
        help="Path where the trained model artefact will be saved.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    logger.info("=== Housing Price Model Training ===")
    logger.info("Training data", path=str(args.data))
    logger.info("Output path  ", path=str(args.out))

    model = HousingPriceModel()
    meta = model.train(args.data)

    logger.info("── Metrics ──────────────────────────")
    logger.info("R²   ", value=round(meta.r2, 4))
    logger.info("MAE  ", value=f"${meta.mae:,.2f}")
    logger.info("RMSE ", value=f"${meta.rmse:,.2f}")
    logger.info("MAPE ", value=f"{meta.mape:.2f}%")
    logger.info("Train samples", value=meta.train_samples)
    logger.info("Test  samples", value=meta.test_samples)
    logger.info("─────────────────────────────────────")

    model.save(args.out)
    logger.info("Done ✓  Model saved to", path=str(args.out))


if __name__ == "__main__":
    main()
