import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/Card";
import { MarketNav } from "@/components/market/MarketNav";

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <BarChart3 size={15} className="text-blue-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-700 text-slate-100 tracking-tight">
              Market Analysis
            </h1>
            <Badge variant="blue">Spring Boot</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated analytics via{" "}
            <code className="font-mono text-slate-400">GET /api/analysis/stats</code>
          </p>
        </div>
      </div>
      <MarketNav />
      {children}
    </div>
  );
}