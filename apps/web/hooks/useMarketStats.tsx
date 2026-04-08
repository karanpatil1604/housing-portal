"use client";

import { useState, useEffect, useCallback } from "react";
import { getMarketStats, getMarketFilters } from "@/lib/api/java-api";
import type { MarketStats, MarketFilters } from "@/types/java-api.types";

export function useMarketStats() {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketStats();
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, loading, error, refetch: fetch };
}

export function useMarketFilters() {
  const [filters, setFilters] = useState<MarketFilters | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketFilters()
      .then(setFilters)
      .catch(() => setFilters(null))
      .finally(() => setLoading(false));
  }, []);

  return { filters, loading };
}