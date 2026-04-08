// ============================================================
// Java Spring Boot API Client — routes through /java-api proxy
// ============================================================
import type {
  MarketStats,
  MarketFilters,
  WhatIfRequest,
  WhatIfResponse,
  ExportParams,
} from "@/types/java-api.types";

function getBase(): string {
  if (typeof window !== "undefined") return "/java-api";
  const origin =
    process.env.NEXT_INTERNAL_ORIGIN ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  return `${origin}/java-api`;
}

async function get<T>(path: string, ttl = 60): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, { next: { revalidate: ttl } });
  if (!res.ok) throw new JavaApiError(res.status, `Java API error: ${path}`);
  return res.json();
}

async function post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${getBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new JavaApiError(res.status, `Java API error: ${path}`);
  return res.json();
}

export class JavaApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "JavaApiError";
  }
}

/** GET /api/analysis/stats — 60s cache */
export async function getMarketStats(): Promise<MarketStats> {
  return get("/api/analysis/stats", 60);
}

/** GET /api/analysis/filters — 5 min cache */
export async function getMarketFilters(): Promise<MarketFilters> {
  return get("/api/analysis/filters", 300);
}

/** POST /api/analysis/what-if */
export async function runWhatIf(req: WhatIfRequest): Promise<WhatIfResponse> {
  return post("/api/analysis/what-if", req);
}

/** GET /api/analysis/export?format=csv|pdf */
export function getExportUrl(params: ExportParams): string {
  const qs = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined) acc[k] = String(v);
      return acc;
    }, {})
  );
  return `${getBase()}/api/analysis/export?${qs.toString()}`;
}
