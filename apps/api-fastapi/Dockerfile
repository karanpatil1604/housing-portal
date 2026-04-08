# ============================================================
#  Housing Price Prediction API — Multi-stage Dockerfile
# ============================================================
#
#  Stage 1 (builder): install all Python dependencies into a
#  virtual environment so only the venv is copied to the final
#  image (no build tools, no pip cache, no wheel debris).
#
#  Stage 2 (runtime): slim Python image + the venv + app code.
#  The model is trained on first startup (or loaded from a
#  mounted volume for production deployments).
# ============================================================

# ── Stage 1: builder ─────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

# System deps needed only to compile certain wheels (numpy, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create an isolated venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies first (layer-cache friendly)
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ── Stage 2: runtime ─────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Non-root user for security
RUN groupadd --gid 1001 appgroup && \
    useradd  --uid 1001 --gid appgroup --no-create-home appuser

WORKDIR /app

# Copy only the venv from the builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application source
COPY app/       ./app/
COPY data/      ./data/

# Directory for persisted model artefacts
RUN mkdir -p /app/models && chown appuser:appgroup /app/models

# Drop to non-root
USER appuser

# ── Environment defaults (override at runtime) ────────────────
ENV ENVIRONMENT=production \
    LOG_FORMAT=json \
    LOG_LEVEL=INFO \
    HOST=0.0.0.0 \
    PORT=8000 \
    WORKERS=1 \
    MODEL_DIR=/app/models \
    TRAINING_DATA_PATH=/app/data/House_Price_Dataset.csv \
    RETRAIN_ON_STARTUP=true

EXPOSE 8000

# Liveness probe used by Docker and Kubernetes
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')" || exit 1

# Use exec form so signals reach uvicorn directly (clean shutdown)
CMD ["sh", "-c", \
     "uvicorn app.main:app \
        --host $HOST \
        --port $PORT \
        --workers $WORKERS \
        --log-level warning \
        --no-access-log"]
