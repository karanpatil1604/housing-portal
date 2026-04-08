"use client";

import { useState, useCallback } from "react";
import { predictSingle } from "@/lib/api/fastapi";
import { useHistory } from "./useHistory";
import type { HousingFeatures, SinglePredictResponse } from "@/types/fastapi.types";

export type PredictionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: SinglePredictResponse }
  | { status: "error"; message: string };

export function usePrediction() {
  const [state, setState] = useState<PredictionState>({ status: "idle" });
  const { add } = useHistory();

  const predict = useCallback(
    async (features: HousingFeatures, label?: string) => {
      setState({ status: "loading" });
      try {
        const data = await predictSingle({ features });
        setState({ status: "success", data });
        add(data, label);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Prediction failed";
        setState({ status: "error", message });
        throw err;
      }
    },
    [add]
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, predict, reset };
}