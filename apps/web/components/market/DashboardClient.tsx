"use client";

import { useState } from "react";
import { MarketFilters } from "./MarketFilters";
import { PriceDistributionChart } from "./PriceDistributionChart";
import type { FeatureImportance } from "@/types/fastapi.types";

interface Props {
  featureImportances: FeatureImportance[];
}

export function DashboardClient({ featureImportances }: Props) {
  const [activeFilters, setActiveFilters] = useState({});

  return (
    <div className="grid lg:grid-cols-4 gap-6 mt-6">
      {/* Sidebar filters */}
      <div className="lg:col-span-1">
        <MarketFilters active={activeFilters} onChange={setActiveFilters} />
      </div>

      {/* Charts */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        <PriceDistributionChart />
        <FeatureImportanceChartWrapper importances={featureImportances} />
      </div>
    </div>
  );
}

// Lazy-import the recharts component only on client
function FeatureImportanceChartWrapper({
  importances,
}: {
  importances: FeatureImportance[];
}) {
  const { FeatureImportanceChart } = require("./FeatureImportanceChart");
  return <FeatureImportanceChart importances={importances} />;
}