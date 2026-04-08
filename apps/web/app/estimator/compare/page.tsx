import type { Metadata } from "next";
import { ComparePanel } from "@/components/estimator/ComparePanel";

export const metadata: Metadata = { title: "Compare Predictions" };

export default function ComparePage() {
  return (
    <div className="animate-slide-up">
      <ComparePanel />
    </div>
  );
}