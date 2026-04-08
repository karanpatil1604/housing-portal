"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { FeatureImportance } from "@/types/fastapi.types";
import { formatFeatureName } from "@/lib/utils/formatters";

interface Props {
  importances: FeatureImportance[];
}

function TooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-lg p-3 shadow-panel text-xs font-mono">
      <p className="text-slate-300 mb-1">{formatFeatureName(d.feature)}</p>
      <p className="text-amber-400">
        importance: {d.abs_importance.toFixed(4)}
      </p>
      <p className="text-slate-500">
        coefficient: {d.coefficient.toFixed(4)}
      </p>
    </div>
  );
}

export function FeatureImportanceChart({ importances }: Props) {
  const sorted = [...importances].sort((a, b) => b.abs_importance - a.abs_importance);
  const max = sorted[0]?.abs_importance ?? 1;

  const data = sorted.map((f) => ({
    ...f,
    label: formatFeatureName(f.feature),
    pct: (f.abs_importance / max) * 100,
  }));

  return (
    <div className="panel p-6">
      <div className="mb-4">
        <h3 className="font-display font-600 text-slate-100 text-base">
          Feature Importance
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Model coefficients by absolute weight
        </p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          layout="vertical"
          barSize={16}
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fill: "#5C7FA8", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={90}
            tick={{ fill: "#8BAAC8", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<TooltipContent />} cursor={{ fill: "rgba(42,63,95,0.25)" }} />
          <Bar dataKey="abs_importance" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={`rgba(251,183,36,${0.35 + (d.pct / 100) * 0.65})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}