"use client";

import { useState, useCallback } from "react";
import { runWhatIf } from "@/lib/api/java-api";
import type { WhatIfRequest, WhatIfResponse } from "@/types/java-api.types";

export type WhatIfState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: WhatIfResponse }
  | { status: "error"; message: string };

export function useWhatIf() {
  const [state, setState] = useState<WhatIfState>({ status: "idle" });

  const run = useCallback(async (req: WhatIfRequest) => {
    setState({ status: "loading" });
    try {
      const data = await runWhatIf(req);
      setState({ status: "success", data });
      return data;
    } catch (e) {
      const message = e instanceof Error ? e.message : "What-if analysis failed";
      setState({ status: "error", message });
      throw e;
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, run, reset };
}