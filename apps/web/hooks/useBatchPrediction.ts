"use client";

import { useState, useCallback } from "react";
import { predictBatch } from "@/lib/api/fastapi";
import type {
  HousingFeatures,
  BatchPredictResponse,
  PredictionResult,
} from "@/types/fastapi.types";

export interface BatchRow {
  index: number;
  features: HousingFeatures;
  result?: PredictionResult;
  error?: string;
}

export type BatchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: BatchPredictResponse; rows: BatchRow[] }
  | { status: "error"; message: string };

export function useBatchPrediction() {
  const [state, setState] = useState<BatchState>({ status: "idle" });

  const predict = useCallback(async (features: HousingFeatures[]) => {
    setState({ status: "loading" });
    try {
      const data = await predictBatch({ features });
      const rows: BatchRow[] = features.map((f, i) => ({
        index: i,
        features: f,
        result: data.predictions[i],
      }));
      setState({ status: "success", data, rows });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Batch failed";
      setState({ status: "error", message });
      throw err;
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, predict, reset };
}