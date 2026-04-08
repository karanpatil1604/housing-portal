# 🏠 Housing Price Prediction API

A **production-grade REST API** for predicting housing prices using Ridge Regression, built with **FastAPI** and **scikit-learn**.

---

## Architecture overview

```
housing-price-api/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/     # predict.py  model_info.py  health.py
│   │   ├── router.py      # aggregates all v1 routers
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py      # pydantic-settings — all env vars in one place
│   │   ├── exceptions.py  # domain exception hierarchy
│   │   └── logging.py     # structured JSON / console logging
│   ├── models/
│   │   └── housing_model.py   # ML wrapper: train / predict / save / load
│   ├── schemas/           # Pydantic request & response models
│   ├── services/
│   │   └── model_service.py   # application façade (lifecycle + formatting)
│   ├── utils/
│   │   ├── exception_handlers.py
│   │   └── middleware.py  # request logging + correlation IDs
│   └── main.py            # create_app factory
├── tests/
│   ├── unit/              # model logic + schema validation
│   └── integration/       # full HTTP round-trip tests
├── data/
│   ├── House_Price_Dataset.csv
│   └── Test_Data_For_Prediction.csv
├── scripts/
│   └── train_model.py     # standalone CLI trainer
├── Dockerfile             # multi-stage build
├── docker-compose.yml
└── requirements.txt
```

---

## Quick-start (local)

### Prerequisites
- Python 3.12+
- `pip`

### 1. Clone & install

```bash
git clone <your-repo-url>
cd housing-price-api

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Configure (optional)

```bash
cp .env.example .env
# Edit .env if you want to change ports, log level, etc.
```

### 3. Run

```bash
uvicorn app.main:app --reload --port 8000
```

The server trains the model automatically on startup.

### 4. Open Swagger UI

```
http://localhost:8000/docs
```

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/v1/health` | Liveness / readiness probe |
| `POST` | `/api/v1/predict` | Single property price prediction |
| `POST` | `/api/v1/predict/batch` | Batch price predictions |
| `GET`  | `/api/v1/model-info` | Coefficients & performance metrics |

### Example: single prediction

```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "square_footage": 1850,
      "bedrooms": 3,
      "bathrooms": 2.0,
      "year_built": 2005,
      "lot_size": 6500,
      "distance_to_city_center": 4.5,
      "school_rating": 8.2
    }
  }'
```

**Response:**
```json
{
  "predicted_price": 271432.50,
  "predicted_price_formatted": "$271,432.50",
  "model_version": "1.0.0",
  "features_received": { ... }
}
```

### Example: batch prediction

```bash
curl -X POST http://localhost:8000/api/v1/predict/batch \
  -H "Content-Type: application/json" \
  -d '{
    "features": [
      {
        "square_footage": 1850, "bedrooms": 3, "bathrooms": 2.0,
        "year_built": 2005, "lot_size": 6500,
        "distance_to_city_center": 4.5, "school_rating": 8.2
      },
      {
        "square_footage": 2400, "bedrooms": 4, "bathrooms": 3.0,
        "year_built": 2010, "lot_size": 8000,
        "distance_to_city_center": 3.0, "school_rating": 9.1
      }
    ]
  }'
```

---

## Running tests

```bash
# All tests with coverage report
pytest

# Unit tests only
pytest tests/unit/ -v

# Integration tests only
pytest tests/integration/ -v

# Single test file
pytest tests/unit/test_model.py -v

# With coverage HTML report (opens htmlcov/index.html)
pytest --cov=app --cov-report=html
```

---

## Docker

### Build & run

```bash
# Build the image
docker build -t housing-price-api:latest .

# Run the container
docker run -p 8000:8000 housing-price-api:latest
```

### Docker Compose (recommended)

```bash
# Start (builds if needed)
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f api

# Stop
docker compose down
```

The trained model is persisted in a named Docker volume (`model_data`), so it
survives container restarts without re-training.

---

## Pre-train the model (optional)

For production images you can bake the model artefact in before deployment:

```bash
python scripts/train_model.py \
  --data  data/House_Price_Dataset.csv \
  --out   models/housing_price_model.joblib
```

Then set `RETRAIN_ON_STARTUP=false` and mount / copy the `.joblib` file into
the container at `/app/models/`.

---

## Configuration reference

All settings can be set via environment variables or a `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `development` | `development` / `staging` / `production` |
| `LOG_LEVEL` | `INFO` | `DEBUG` / `INFO` / `WARNING` / `ERROR` |
| `LOG_FORMAT` | `console` | `console` (pretty) or `json` (structured) |
| `PORT` | `8000` | HTTP listen port |
| `WORKERS` | `1` | Uvicorn worker count |
| `MODEL_DIR` | `models` | Directory for saved model artefact |
| `TRAINING_DATA_PATH` | `data/House_Price_Dataset.csv` | CSV used for training |
| `RETRAIN_ON_STARTUP` | `true` | Re-train even if artefact exists |
| `MAX_BATCH_SIZE` | `500` | Maximum items per `/predict/batch` call |

---

## Model details

| Item | Value |
|------|-------|
| Algorithm | Ridge Regression (α = 1.0) |
| Pre-processing | `StandardScaler` (fitted on training split only) |
| Train / test split | 80 / 20, `random_state=42` |
| Features | `square_footage`, `bedrooms`, `bathrooms`, `year_built`, `lot_size`, `distance_to_city_center`, `school_rating` |
| Target | `price` (USD) |
| Serialisation | `joblib` |

See **`GET /api/v1/model-info`** for live R², MAE, RMSE and MAPE values.

---

## Extending the project

| Goal | Where to change |
|------|----------------|
| Swap algorithm (e.g. Gradient Boosting) | `app/models/housing_model.py` — replace the `Pipeline` |
| Add a new feature | `app/models/housing_model.py` (`FEATURE_COLUMNS`) + `app/schemas/prediction.py` |
| Add a new endpoint | Create `app/api/v1/endpoints/<name>.py`, register in `app/api/v1/router.py` |
| Change serialisation format | `app/models/housing_model.py` `save` / `load` methods |
| Add authentication | FastAPI `Depends` in `app/api/v1/dependencies.py` |
| Add a database | New service in `app/services/`, wired in `app/main.py` lifespan |
