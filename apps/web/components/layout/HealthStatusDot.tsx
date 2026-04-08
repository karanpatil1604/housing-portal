"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { HealthStatus } from "@/types/fastapi.types";

const statusConfig: Record<
  HealthStatus,
  { color: string; pulse: string; label: string }
> = {
  healthy: {
    color: "bg-emerald-400",
    pulse: "bg-emerald-400",
    label: "ML API healthy",
  },
  degraded: {
    color: "bg-amber-400",
    pulse: "bg-amber-400",
    label: "ML API degraded",
  },
  unhealthy: {
    color: "bg-rose-400",
    pulse: "bg-rose-400",
    label: "ML API offline",
  },
};

export function HealthStatusDot() {
  const [status, setStatus] = useState<HealthStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/fastapi/api/v1/health", {
          cache: "no-store",
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setStatus(data.status as HealthStatus);
        } else if (!cancelled) {
          setStatus("unhealthy");
        }
      } catch {
        if (!cancelled) setStatus("unhealthy");
      }
    }

    poll();
    const id = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!status) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
        <span className="text-xs font-mono text-slate-600 hidden md:block">
          checking…
        </span>
      </div>
    );
  }

  const cfg = statusConfig[status];

  return (
    <div
      className="flex items-center gap-1.5"
      title={cfg.label}
      aria-label={cfg.label}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
            cfg.pulse
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            cfg.color
          )}
        />
      </span>
      <span className="text-xs font-mono text-slate-500 hidden md:block">
        {status}
      </span>
    </div>
  );
}