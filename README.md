# Housing Portal


```
apps/api-fastapi/  →  apps/api-java/  →  apps/web/
FastAPI :8000          Spring Boot :8080    Next.js :3000
```

---

## One-Command Demo Development Server

```bash
cd housing-portal
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d --build
```

Open **http://localhost:3000** — done.

> First build takes 3–5 minutes (Maven + npm). Subsequent starts take ~30 seconds.

---

## Project Structure

```
housing-portal/
├── .env.example              ← copy to .env
├── docker-compose.yml        ← main (demo + production)
├── docker-compose.dev.yml    ← dev override (hot reload)
├── apps/
│   ├── api-fastapi/
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   └── ...
│   ├── api-java/
│   │   ├── Dockerfile
│   │   └── src/...
│   └── web/
│       ├── Dockerfile        ← production (standalone build)
│       ├── Dockerfile.dev    ← dev (hot reload)
│       └── app/...
```

---

## Environment Variables

All variables live in one `.env` file at the root.
You only need to change these if ports clash on your machine:

| Variable | Default | Change if… |
|----------|---------|-----------|
| `FASTAPI_PORT` | `8000` | port 8000 is taken |
| `JAVA_API_PORT` | `8080` | port 8080 is taken |
| `WEB_PORT` | `3000` | port 3000 is taken |

Everything else (internal URLs, CORS, Spring profile) is pre-wired.

---

## Manual Local Development (Without Docker)

Run each service in a separate terminal. Ensure ports `8000`, `8080`, and `3000` are available.

### Terminal 1: FastAPI Server

```bash
cd apps/api-fastapi
python3 -m venv .venv
. .venv/bin/activate
```
```bash
pip install -r requirements.txt
export FASTAPI_PORT=8000
export JAVA_API_URL=http://localhost:8080
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Windows (PowerShell):**
```powershell
$env:FASTAPI_PORT=8000
$env:JAVA_API_URL=http://localhost:8080
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2: Java Spring Boot API

```bash
cd apps/api-java
export JAVA_API_PORT=8080
export FASTAPI_URL=http://localhost:8000
./mvn spring-boot:run
```

**Windows (CMD):**
```cmd
set JAVA_API_PORT=8080
set FASTAPI_URL=http://localhost:8000
mvn spring-boot:run
```

### Terminal 3: Next.js Web Frontend

```bash
cd apps/web
npm install
export NEXT_PUBLIC_API_URL=http://localhost:8080
export WEB_PORT=3000
npm run dev
```

**Windows (PowerShell):**
```powershell
$env:NEXT_PUBLIC_API_URL=http://localhost:8080
$env:WEB_PORT=3000
npm run dev
```

Open **http://localhost:3000** in your browser.




## Useful Commands

```bash
# Start everything (builds if needed)
docker compose up --build

# Start in background
docker compose up --build -d

# Watch logs for a specific service
docker compose logs -f fastapi
docker compose logs -f api-java
docker compose logs -f web

# Restart one service without rebuilding others
docker compose restart api-java

# Rebuild one service only
docker compose up --build api-java

# Stop everything
docker compose down

# Stop and remove volumes
docker compose down -v

# Check health of all services
docker compose ps

# Rebuild from scratch if Docker has stale cache
docker compose down
docker compose build --no-cache
docker compose up
```

---

## Verify Each Service Is Running

After `docker compose up`, in a new terminal:

```bash
# FastAPI ML — should return {"status":"healthy",...}
curl http://127.0.0.1:8000/api/v1/health

# Java API — should return {"status":"UP"}
curl http://127.0.0.1:8080/actuator/health

# Java market stats (calls FastAPI internally)
curl http://127.0.0.1:8080/api/analysis/stats

# Next.js — should return HTML
curl -s http://127.0.0.1:3000 | head -5
```
