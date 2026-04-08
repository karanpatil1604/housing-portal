import type { Metadata } from "next";
import { HistoryTable } from "@/components/estimator/HistoryTable";
import { PredictionChart } from "@/components/estimator/PredictionChart";
import { HistoryPageClient } from "@/components/estimator/HistoryPageClient";

export const metadata: Metadata = { title: "Prediction History" };

export default function HistoryPage() {
  return (
    <div className="animate-slide-up flex flex-col gap-6">
      <HistoryPageClient />
    </div>
  );
}