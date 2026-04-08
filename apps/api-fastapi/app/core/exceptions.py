"""
Domain-level exception hierarchy.

Keeping exceptions in one place makes it trivial to add new error types
and ensures consistent HTTP status mapping in the exception handlers.
"""

from __future__ import annotations


class HousingAPIError(Exception):
    """Base class for all application errors."""

    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"

    def __init__(self, message: str, detail: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.detail = detail


# ── Model errors ─────────────────────────────────────────────────────────────


class ModelNotTrainedError(HousingAPIError):
    """Raised when a prediction is requested but no model is loaded."""

    status_code = 503
    error_code = "MODEL_NOT_READY"


class ModelTrainingError(HousingAPIError):
    """Raised when model training fails."""

    status_code = 500
    error_code = "MODEL_TRAINING_FAILED"


class ModelLoadError(HousingAPIError):
    """Raised when persisted model artefact cannot be loaded."""

    status_code = 500
    error_code = "MODEL_LOAD_FAILED"


# ── Data errors ───────────────────────────────────────────────────────────────


class DataValidationError(HousingAPIError):
    """Raised when input data fails domain-level validation."""

    status_code = 422
    error_code = "DATA_VALIDATION_ERROR"


class BatchSizeLimitError(HousingAPIError):
    """Raised when a batch request exceeds the configured maximum."""

    status_code = 413
    error_code = "BATCH_TOO_LARGE"


# ── Resource errors ───────────────────────────────────────────────────────────


class TrainingDataNotFoundError(HousingAPIError):
    """Raised when the training CSV file is missing."""

    status_code = 503
    error_code = "TRAINING_DATA_NOT_FOUND"
