"use client";

import { useState, useEffect, useCallback } from "react";
import type { HousingFeatures, SinglePredictResponse } from "@/types/fastapi.types";

export interface HistoryEntry {
  id: string;
  timestamp: string;
  features: HousingFeatures;
  predicted_price: number;
  predicted_price_formatted: string;
  model_version: string;
  label?: string;
}

const STORAGE_KEY = "hp_prediction_history";
const MAX_ENTRIES = 50;

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const save = useCallback((data: HistoryEntry[]) => {
    setEntries(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const add = useCallback(
    (response: SinglePredictResponse, label?: string) => {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        features: response.features_received,
        predicted_price: response.predicted_price,
        predicted_price_formatted: response.predicted_price_formatted,
        model_version: response.model_version,
        label,
      };
      setEntries((prev) => {
        const next = [entry, ...prev].slice(0, MAX_ENTRIES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      return entry.id;
    },
    []
  );

  const remove = useCallback(
    (id: string) => save(entries.filter((e) => e.id !== id)),
    [entries, save]
  );

  const clear = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getById = useCallback(
    (id: string) => entries.find((e) => e.id === id),
    [entries]
  );

  return { entries, add, remove, clear, getById, isLoaded };
}