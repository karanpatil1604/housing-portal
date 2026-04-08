"use client";

import { useState, useCallback } from "react";

export type ApiState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export function useApi<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  const [state, setState] = useState<ApiState<TResult>>({ status: "idle" });

  const execute = useCallback(
    async (...args: TArgs) => {
      setState({ status: "loading" });
      try {
        const data = await fn(...args);
        setState({ status: "success", data });
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setState({ status: "error", error: message });
        throw err;
      }
    },
    [fn]
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, execute, reset };
}