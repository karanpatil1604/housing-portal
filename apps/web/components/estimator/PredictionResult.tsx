"use client";

import { cn } from "@/lib/utils/cn";
import { Badge, Skeleton } from "@/components/ui/Card";
import { formatFeatureName, formatNumber } from "@/lib/utils/formatters";
import type { PredictionState } from "@/hooks/usePrediction";
import {
  TrendingUp,
  Hash,
  Calendar,
  Maximize2,
  Star,
  MapPin,
} from "lucide-react";

const featureIcons: Record<string, React.ReactNode> = {
  square_footage: <Maximize2 size={12} />,
  bedrooms: <Hash size={12} />,
  bathrooms: <Hash size={12} />,
  year_built: <Calendar size={12} />,
  lot_size: <Maximize2 size={12} />,
  distance_to_city_center: <MapPin size={12} />,
  school_rating: <Star size={12} />,
};

interface Props {
  state: PredictionState;
}

export function PredictionResult({ state }: Props) {
  if (state.status === "idle") {
    return (
      <div className="panel p-6 h-full flex flex-col items-center justify-center gap-3 text-center min-h-[340px]">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/8 border border-amber-500/15 flex items-center justify-center">
          <TrendingUp size={22} className="text-amber-500/50" />
        </div>
        <p className="text-slate-400 text-sm">
          Fill in the form and click <br />
          <span className="text-amber-400 font-mono text-xs">
            Predict Price
          </span>{" "}
          to see the result
        </p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="panel p-6 flex flex-col gap-5 min-h-[340px]">
        <Skeleton height="h-8" className="w-2/3" />
        <Skeleton height="h-14" className="w-full" />
        <div className="grid grid-cols-2 gap-3 mt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="h-10" />
          ))}
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="panel p-6 min-h-[340px] flex items-center justify-center">
        <p className="text-rose-400 text-sm font-mono">{state.message}</p>
      </div>
    );
  }

  const { data } = state;
  const features = data.features_received;

  return (
    <div className="panel p-6 flex flex-col gap-5 animate-slide-up min-h-[340px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            Predicted Price
          </p>
          <p className="font-display text-4xl font-700 text-gradient-amber tabular-nums">
            {data.predicted_price_formatted}
          </p>
        </div>
        <Badge variant="emerald">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          live
        </Badge>
      </div>

      {/* Model version */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
        <span>model</span>
        <span className="text-slate-500">{data.model_version}</span>
      </div>

      <div className="section-rule" />

      {/* Feature echo */}
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-slate-600 mb-3">
          Features Received
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(features) as [string, number][]).map(
            ([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-2 border border-slate-700/30"
              >
                <span className="text-slate-600 shrink-0">
                  {featureIcons[key] ?? <Hash size={12} />}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-slate-600 truncate">
                    {formatFeatureName(key)}
                  </p>
                  <p className="text-sm font-mono text-slate-200 tabular-nums">
                    {formatNumber(value, key === "school_rating" || key === "distance_to_city_center" ? 1 : 0)}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}