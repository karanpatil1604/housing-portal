"use client";

import { useHistory } from "@/hooks/useHistory";
import { PredictionChart } from "./PredictionChart";
import { HistoryTable } from "./HistoryTable";
import { EmptyState } from "@/components/ui/Card";
import { Clock } from "lucide-react";

export function HistoryPageClient() {
  const { entries, isLoaded } = useHistory();

  if (!isLoaded) return null;

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Clock size={28} />}
        title="No predictions yet"
        description="Run a prediction to see your history here."
      />
    );
  }

  return (
    <>
      <PredictionChart entries={entries} />
      <HistoryTable />
    </>
  );
}