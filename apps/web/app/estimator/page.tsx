import type { Metadata } from "next";
import { PredictionForm } from "@/components/estimator/PredictionForm";

export const metadata: Metadata = { title: "Property Estimator" };

export default function EstimatorPage() {
  return (
    <div className="animate-slide-up">
      <PredictionForm />
    </div>
  );
}