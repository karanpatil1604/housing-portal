"use client";

import { useState } from "react";
import { useHistory, type HistoryEntry } from "@/hooks/useHistory";
import { EmptyState } from "@/components/ui/Card";
import {
  formatFeatureName,
  formatTimestamp,
  formatUSD,
  formatDelta,
  formatPercent,
} from "@/lib/utils/formatters";
import { GitCompare, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FEATURE_KEYS = [
  "square_footage",
  "bedrooms",
  "bathrooms",
  "year_built",
  "lot_size",
  "distance_to_city_center",
  "school_rating",
] as const;

export function ComparePanel() {
  const { entries, isLoaded } = useHistory();
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  if (!isLoaded) return null;

  if (entries.length < 2) {
    return (
      <EmptyState
        icon={<GitCompare size={28} />}
        title="Need at least 2 predictions"
        description="Run more predictions to compare them side by side."
      />
    );
  }

  const left = entries.find((e) => e.id === leftId) ?? entries[0];
  const right = entries.find((e) => e.id === rightId) ?? entries[1];

  const delta = right.predicted_price - left.predicted_price;
  const deltaPct = ((delta / left.predicted_price) * 100);

  const entryOptions = entries.map((e) => ({
    value: e.id,
    label: e.label ?? formatTimestamp(e.timestamp),
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Property A", value: leftId, onChange: setLeftId, current: left },
          { label: "Property B", value: rightId, onChange: setRightId, current: right },
        ].map(({ label, value, onChange }) => (
          <div key={label}>
            <label className="label-base">{label}</label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="input-base"
            >
              {entryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Price comparison banner */}
      <div className="panel p-5 grid grid-cols-3 gap-4 items-center">
        <div className="text-center">
          <p className="text-[10px] font-mono text-slate-600 uppercase mb-1">Property A</p>
          <p className="font-display text-2xl font-700 text-amber-400 tabular-nums">
            {left.predicted_price_formatted}
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {left.label ?? formatTimestamp(left.timestamp)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-mono font-semibold px-3 py-1.5 rounded-full",
              delta > 0
                ? "bg-emerald-500/10 text-emerald-400"
                : delta < 0
                ? "bg-rose-500/10 text-rose-400"
                : "bg-slate-700/40 text-slate-400"
            )}
          >
            {delta > 0 ? (
              <TrendingUp size={13} />
            ) : delta < 0 ? (
              <TrendingDown size={13} />
            ) : null}
            {formatPercent(deltaPct)}
          </div>
          <p className="text-xs font-mono text-slate-600">
            {formatDelta(delta)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-mono text-slate-600 uppercase mb-1">Property B</p>
          <p className="font-display text-2xl font-700 text-amber-400 tabular-nums">
            {right.predicted_price_formatted}
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {right.label ?? formatTimestamp(right.timestamp)}
          </p>
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="panel overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/40">
          <h3 className="font-display font-600 text-slate-100 text-base">
            Feature Comparison
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/30">
              <th className="px-5 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-slate-600">
                Feature
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-mono uppercase tracking-wider text-amber-600">
                A
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-mono uppercase tracking-wider text-slate-600">
                B
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-mono uppercase tracking-wider text-slate-600">
                Diff
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_KEYS.map((key) => {
              const lv = left.features[key];
              const rv = right.features[key];
              const diff = rv - lv;
              return (
                <tr
                  key={key}
                  className="border-b border-slate-700/20 hover:bg-slate-800/30"
                >
                  <td className="px-5 py-2.5 text-xs font-mono text-slate-500">
                    {formatFeatureName(key)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs text-amber-400 tabular-nums">
                    {lv}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-xs text-slate-300 tabular-nums">
                    {rv}
                  </td>
                  <td
                    className={cn(
                      "px-5 py-2.5 text-right font-mono text-xs tabular-nums",
                      diff > 0
                        ? "text-emerald-400"
                        : diff < 0
                        ? "text-rose-400"
                        : "text-slate-600"
                    )}
                  >
                    {diff > 0 ? "+" : ""}{diff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}