import { getMarketStats } from "@/lib/api/java-api";
import { getModelInfo } from "@/lib/api/fastapi";
import { StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Card";
import { formatNumber, formatUSD } from "@/lib/utils/formatters";
import { TrendingUp, Database, Brain, AlertTriangle } from "lucide-react";

export async function StatsDashboard() {
  let stats;
  let model;

  try {
    [stats, model] = await Promise.all([getMarketStats(), getModelInfo()]);
  } catch {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-500/8 border border-rose-500/20">
        <AlertTriangle size={16} className="text-rose-400 shrink-0" />
        <p className="text-sm text-rose-300 font-mono">
          Could not load market data. Ensure Java API and FastAPI are running.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Model metadata strip */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-700/40">
        <Brain size={14} className="text-amber-400" />
        <span className="text-xs font-mono text-slate-400">
          {model.model_name}
        </span>
        <span className="text-slate-700">·</span>
        <Badge variant="slate">{model.algorithm}</Badge>
        <Badge variant="emerald">
          R² {model.metrics.r2_score.toFixed(3)}
        </Badge>
        <Badge variant="slate">
          MAE {formatUSD(model.metrics.mae)}
        </Badge>
        <Badge variant="slate">
          MAPE {model.metrics.mape.toFixed(1)}%
        </Badge>
        <span className="text-slate-700">·</span>
        <span className="text-xs font-mono text-slate-500">
          {model.metrics.train_samples.toLocaleString()} train /{" "}
          {model.metrics.test_samples.toLocaleString()} test samples
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg Price"
          value={stats.avg_price_formatted}
          sub="across sample"
          accent
        />
        <StatCard
          label="Median Price"
          value={stats.median_price_formatted}
          sub="50th percentile"
        />
        <StatCard
          label="Price / Sq Ft"
          value={`$${formatNumber(stats.price_per_sqft, 0)}`}
          sub="avg rate"
        />
        <StatCard
          label="Avg School Rating"
          value={`${formatNumber(stats.avg_school_rating, 1)} / 10`}
          sub="nearest school"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Price Range"
          value={`${formatUSD(stats.price_range.min)} – ${formatUSD(stats.price_range.max)}`}
          sub="min to max"
        />
        <StatCard
          label="Avg Square Footage"
          value={`${formatNumber(stats.avg_square_footage, 0)} sqft`}
          sub="liveable area"
        />
        <StatCard
          label="Avg Year Built"
          value={String(Math.round(stats.avg_year_built))}
          sub="median construction year"
        />
      </div>
    </div>
  );
}