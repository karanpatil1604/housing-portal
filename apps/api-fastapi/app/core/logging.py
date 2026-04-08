"""
Structured logging configuration.

Uses structlog for rich, queryable logs in JSON (production) or
developer-friendly coloured console output (development).

Falls back to stdlib ``logging`` if structlog is not installed so that
the ML and service layers can be unit-tested without the full dependency
set (useful in CI environments that only have scikit-learn available).
"""

from __future__ import annotations

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any

try:
    import structlog as _structlog

    _STRUCTLOG_AVAILABLE = True
except ModuleNotFoundError:  # pragma: no cover
    _structlog = None  # type: ignore[assignment]
    _STRUCTLOG_AVAILABLE = False


# ---------------------------------------------------------------------------
# Stdlib fallback logger (used when structlog is absent)
# ---------------------------------------------------------------------------

class _StdlibBoundLogger:
    """Minimal structlog-compatible logger backed by stdlib logging."""

    def __init__(self, logger: logging.Logger) -> None:
        self._logger = logger

    def _log(self, level: int, event: str, **kw: Any) -> None:
        if kw:
            extras = " ".join(f"{k}={v!r}" for k, v in kw.items())
            msg = f"{event}  {extras}"
        else:
            msg = event
        self._logger.log(level, msg)

    def debug(self, event: str, **kw: Any) -> None:
        self._log(logging.DEBUG, event, **kw)

    def info(self, event: str, **kw: Any) -> None:
        self._log(logging.INFO, event, **kw)

    def warning(self, event: str, **kw: Any) -> None:
        self._log(logging.WARNING, event, **kw)

    warn = warning

    def error(self, event: str, **kw: Any) -> None:
        self._log(logging.ERROR, event, **kw)

    def critical(self, event: str, **kw: Any) -> None:
        self._log(logging.CRITICAL, event, **kw)

    def exception(self, event: str, **kw: Any) -> None:
        if kw:
            extras = " ".join(f"{k}={v!r}" for k, v in kw.items())
            msg = f"{event}  {extras}"
        else:
            msg = event
        self._logger.exception(msg)

    def bind(self, **kw: Any) -> "_StdlibBoundLogger":
        return self


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def configure_logging(log_level: str = "INFO", log_format: str = "console") -> None:
    """
    Bootstrap the logging stack.

    Call this once at application startup before any log statements.

    Args:
        log_level:   Standard Python level name.
        log_format:  ``"json"`` for machine-readable, ``"console"`` for humans.
    """
    level = getattr(logging, log_level.upper(), logging.INFO)

    if _STRUCTLOG_AVAILABLE:
        _configure_structlog(level, log_format)
    else:
        _configure_stdlib(level, log_format)

    # Quieten noisy third-party loggers
    for noisy in ("uvicorn.access", "uvicorn.error", "httpx"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str) -> Any:
    """Return a bound logger for *name* (structlog or stdlib fallback)."""
    if _STRUCTLOG_AVAILABLE:
        return _structlog.get_logger(name)
    return _StdlibBoundLogger(logging.getLogger(name))


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _configure_structlog(level: int, log_format: str) -> None:
    shared_processors: list[Any] = [
        _structlog.contextvars.merge_contextvars,
        _structlog.stdlib.add_logger_name,
        _structlog.stdlib.add_log_level,
        _structlog.stdlib.PositionalArgumentsFormatter(),
        _structlog.processors.TimeStamper(fmt="iso"),
        _structlog.processors.StackInfoRenderer(),
    ]

    renderer: Any = (
        _structlog.processors.JSONRenderer()
        if log_format == "json"
        else _structlog.dev.ConsoleRenderer(colors=True)
    )

    _structlog.configure(
        processors=[
            *shared_processors,
            _structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=_structlog.stdlib.LoggerFactory(),
        wrapper_class=_structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = _structlog.stdlib.ProcessorFormatter(
        processors=[
            _structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
        foreign_pre_chain=shared_processors,
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)


def _configure_stdlib(level: int, log_format: str) -> None:
    """Plain stdlib logging — used when structlog is unavailable."""

    class _JsonFormatter(logging.Formatter):
        def format(self, record: logging.LogRecord) -> str:
            payload = {
                "ts": datetime.now(timezone.utc).isoformat(),
                "level": record.levelname,
                "logger": record.name,
                "event": record.getMessage(),
            }
            if record.exc_info:
                payload["exc"] = self.formatException(record.exc_info)
            return json.dumps(payload)

    handler = logging.StreamHandler(sys.stdout)
    if log_format == "json":
        handler.setFormatter(_JsonFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                fmt="%(asctime)s [%(levelname)-8s] %(name)s: %(message)s",
                datefmt="%Y-%m-%dT%H:%M:%S",
            )
        )

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)
