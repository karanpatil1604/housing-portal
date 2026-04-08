"use client";

import { useState } from "react";
import { useHistory, type HistoryEntry } from "@/hooks/useHistory";
import { Button } from "@/components/ui/Button";
import { Badge, EmptyState } from "@/components/ui/Card";
import { formatTimestamp, formatFeatureName } from "@/lib/utils/formatters";
import { Trash2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SortKey = "timestamp" | "predicted_price";
type SortDir = "asc" | "desc";

export function HistoryTable() {
  const { entries, remove, clear, isLoaded } = useHistory();
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!isLoaded) return null;

  const sorted = [...entries].sort((a, b) => {
    const av = sortKey === "timestamp"
      ? new Date(a.timestamp).getTime()
      : a.predicted_price;
    const bv = sortKey === "timestamp"
      ? new Date(b.timestamp).getTime()
      : b.predicted_price;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Clock size={28} />}
        title="No predictions yet"
        description="Run a prediction to see your history here."
      />
    );
  }

  return (
    <div className="panel overflow-hidden">
      {/* Table header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/40">
        <h3 className="font-display font-600 text-slate-100 text-base">
          Prediction History
          <span className="ml-2 text-xs font-mono text-slate-600 font-normal">
            ({entries.length})
          </span>
        </h3>
        <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} onClick={clear}>
          Clear all
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/30">
              {[
                { key: "timestamp" as SortKey, label: "Time" },
                { key: null, label: "Label" },
                { key: "predicted_price" as SortKey, label: "Price" },
                { key: null, label: "Beds/Baths" },
                { key: null, label: "Sq Ft" },
                { key: null, label: "" },
              ].map(({ key, label }, i) => (
                <th
                  key={i}
                  className={cn(
                    "px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-slate-600",
                    key && "cursor-pointer hover:text-slate-400 transition-colors select-none"
                  )}
                  onClick={() => key && toggleSort(key)}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {key && sortKey === key && (
                      sortDir === "desc"
                        ? <ChevronDown size={11} />
                        : <ChevronUp size={11} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry) => (
              <>
                <tr
                  key={entry.id}
                  className="border-b border-slate-700/20 hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {formatTimestamp(entry.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    {entry.label ? (
                      <span className="text-slate-300 text-xs">{entry.label}</span>
                    ) : (
                      <span className="text-slate-600 text-xs italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-amber-400 font-semibold tabular-nums whitespace-nowrap">
                    {entry.predicted_price_formatted}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">
                    {entry.features.bedrooms}bd / {entry.features.bathrooms}ba
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400 tabular-nums">
                    {entry.features.square_footage.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={12} />}
                      onClick={(e) => { e.stopPropagation(); remove(entry.id); }}
                    />
                  </td>
                </tr>
                {/* Expandable feature row */}
                {expanded === entry.id && (
                  <tr key={`${entry.id}-exp`} className="bg-slate-900/60">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                        {(Object.entries(entry.features) as [string, number][]).map(
                          ([k, v]) => (
                            <div key={k} className="text-center">
                              <p className="text-[9px] font-mono text-slate-600 uppercase">
                                {formatFeatureName(k)}
                              </p>
                              <p className="text-xs font-mono text-slate-300 tabular-nums">
                                {v}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}