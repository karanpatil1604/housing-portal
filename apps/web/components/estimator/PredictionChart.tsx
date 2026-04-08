"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { formatFeatureName, formatUSD } from "@/lib/utils/formatters";
import type { HistoryEntry } from "@/hooks/useHistory";

interface Props {
  entries: HistoryEntry[];
}

// Custom tooltip
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-lg p-3 shadow-panel">
      <p className="text-xs font-mono text-slate-400 mb-1 truncate max-w-[180px]">
        {d.label || `Prediction #${d.index + 1}`}
      </p>
      <p className="font-mono text-amber-400 font-semibold text-sm">
        {d.formatted}
      </p>
      <p className="text-xs font-mono text-slate-600 mt-0.5">
        {d.sqft.toLocaleString()} sqft · {d.beds}bd / {d.baths}ba
      </p>
    </div>
  );
}

export function PredictionChart({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="panel p-6 flex items-center justify-center h-64 text-slate-600 text-sm font-mono">
        No history to chart yet
      </div>
    );
  }

  const data = [...entries]
    .reverse()
    .slice(-12)
    .map((e, i) => ({
      index: i,
      label: e.label,
      price: e.predicted_price,
      formatted: e.predicted_price_formatted,
      sqft: e.features.square_footage,
      beds: e.features.bedrooms,
      baths: e.features.bathrooms,
    }));

  const avg = data.reduce((s, d) => s + d.price, 0) / data.length;

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-600 text-slate-100 text-base">
            Prediction History
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Last {data.length} predictions
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-slate-600">avg</p>
          <p className="text-sm font-mono text-amber-400 tabular-nums">
            {formatUSD(avg)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="index"
            tickFormatter={(i) => data[i]?.label?.slice(0, 8) ?? `#${i + 1}`}
            tick={{ fill: "#5C7FA8", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: "#5C7FA8", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(42,63,95,0.3)" }} />
          <ReferenceLine
            y={avg}
            stroke="#FBB724"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
          />
          <Bar dataKey="price" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={
                  data[i].price > avg
                    ? "rgba(251,183,36,0.8)"
                    : "rgba(92,127,168,0.7)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}