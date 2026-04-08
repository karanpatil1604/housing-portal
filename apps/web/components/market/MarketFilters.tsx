"use client";

import { useMarketFilters } from "@/hooks/useMarketStats";
import { Skeleton } from "@/components/ui/Card";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ActiveFilters {
  bedrooms?: string;
  bathrooms?: string;
  yearBuiltRange?: string;
  distanceRange?: string;
  schoolRatingRange?: string;
}

interface Props {
  active: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
}

export function MarketFilters({ active, onChange }: Props) {
  const { filters, loading } = useMarketFilters();

  const set = (key: keyof ActiveFilters) => (value: string) =>
    onChange({
      ...active,
      [key]: active[key] === value ? undefined : value,
    });

  if (loading) {
    return (
      <div className="panel p-4 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="h-8" />
        ))}
      </div>
    );
  }

  if (!filters) return null;

  const sections: {
    label: string;
    key: keyof ActiveFilters;
    options: { value: string; label: string }[];
  }[] = [
    { label: "Bedrooms", key: "bedrooms", options: filters.bedrooms },
    { label: "Bathrooms", key: "bathrooms", options: filters.bathrooms },
    { label: "Year Built", key: "yearBuiltRange", options: filters.year_built_ranges },
    { label: "Distance to City", key: "distanceRange", options: filters.distance_ranges },
    { label: "School Rating", key: "schoolRatingRange", options: filters.school_rating_ranges },
  ];

  return (
    <div className="panel p-4 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={13} className="text-amber-400" />
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Filters
        </span>
      </div>

      {sections.map(({ label, key, options }) => (
        <div key={key}>
          <p className="label-base mb-2">{label}</p>
          <div className="flex flex-col gap-1">
            {options.map((opt) => {
              const selected = active[key] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => set(key)(opt.value)}
                  className={cn(
                    "flex items-center justify-between w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all duration-100",
                    selected
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent"
                  )}
                >
                  <span>{opt.label}</span>
                  {selected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {Object.values(active).some(Boolean) && (
        <button
          onClick={() => onChange({})}
          className="text-xs font-mono text-slate-600 hover:text-rose-400 transition-colors mt-1"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}