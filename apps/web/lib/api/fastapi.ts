// ============================================================
// FastAPI Client — all calls route through /fastapi proxy
// Endpoint shapes are strictly per OpenAPI spec
// ============================================================
import type {
  SinglePredictRequest,
  SinglePredictResponse,
  BatchPredictRequest,
  BatchPredictResponse,
  ModelInfoResponse,
  HealthResponse,
} from "@/types/fastapi.types";

function getBase(): string {
  if (typeof window !== "undefined") return "/fastapi";
  const origin =
    process.env.NEXT_INTERNAL_ORIGIN ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  return `${origin}/fastapi`;
}

async function post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new FastApiError(res.status, err?.detail ?? "FastAPI error", path);
  }
  return res.json();
}

async function get<TRes>(path: string, ttl?: number): Promise<TRes> {
  const res = await fetch(`${getBase()}${path}`, {
    next: ttl ? { revalidate: ttl } : { revalidate: 0 },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new FastApiError(res.status, err?.detail ?? "FastAPI error", path);
  }
  return res.json();
}

export class FastApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public endpoint: string
  ) {
    super(message);
    this.name = "FastApiError";
  }
}

// ── Endpoints ────────────────────────────────────────────────

/** POST /api/v1/predict */
export async function predictSingle(
  req: SinglePredictRequest
): Promise<SinglePredictResponse> {
  return post("/api/v1/predict", req);
}

/** POST /api/v1/predict/batch */
export async function predictBatch(
  req: BatchPredictRequest
): Promise<BatchPredictResponse> {
  return post("/api/v1/predict/batch", req);
}

/** GET /api/v1/model-info — cached 5 min */
export async function getModelInfo(): Promise<ModelInfoResponse> {
  return get("/api/v1/model-info", 300);
}

/** GET /api/v1/health — no cache */
export async function getHealth(): Promise<HealthResponse> {
  return get("/api/v1/health");
}
