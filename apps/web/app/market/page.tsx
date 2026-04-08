import type { Metadata } from "next";
import { Suspense } from "react";
import { StatsDashboard } from "@/components/market/StatsDashboard";
import { DashboardClient } from "@/components/market/DashboardClient";
import { getModelInfo } from "@/lib/api/fastapi";
import { Skeleton } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Market Analysis" };
export const revalidate = 60;

export default async function MarketPage() {
  let featureImportances: import("@/types/fastapi.types").FeatureImportance[] = [];
  try {
    const model = await getModelInfo();
    featureImportances = model.feature_importances ?? [];
  } catch {}

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <Suspense
        fallback={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} height="h-20" />
            ))}
          </div>
        }
      >
        <StatsDashboard />
      </Suspense>
      <DashboardClient featureImportances={featureImportances} />
    </div>
  );
}