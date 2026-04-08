import type { Metadata } from "next";
import { WhatIfPanel } from "@/components/market/WhatIfPanel";

export const metadata: Metadata = { title: "What-If Analysis" };

export default function WhatIfPage() {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="font-display font-600 text-slate-100 text-lg">
          What-If Scenario Analysis
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Model how changes to property features affect predicted price.
          Calls{" "}
          <code className="font-mono text-xs text-slate-400">
            POST /api/analysis/what-if
          </code>{" "}
          → Java API → FastAPI batch.
        </p>
      </div>
      <WhatIfPanel />
    </div>
  );
}