import type { Metadata } from "next";
import { BatchUploadForm } from "@/components/estimator/BatchUploadForm";

export const metadata: Metadata = { title: "Batch Prediction" };

export default function BatchPage() {
  return (
    <div className="animate-slide-up">
      <BatchUploadForm />
    </div>
  );
}