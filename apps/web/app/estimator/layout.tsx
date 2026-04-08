import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/Card";
import { EstimatorNav } from "@/components/estimator/EstimatorNav";

export default function EstimatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Building2 size={15} className="text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-700 text-slate-100 tracking-tight">
              Property Estimator
            </h1>
            <Badge variant="amber">FastAPI</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ML-powered predictions via{" "}
            <code className="font-mono text-slate-400">POST /api/v1/predict</code>
          </p>
        </div>
      </div>
      <EstimatorNav />
      {children}
    </div>
  );
}