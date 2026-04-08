"use client";

import { useState } from "react";
import { useWhatIf } from "@/hooks/useWhatIf";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorAlert } from "@/components/ui/ErrorBoundary";
import { Badge, Skeleton } from "@/components/ui/Card";
import {
  housingFeaturesDefaults,
  fieldMeta,
} from "@/lib/validations/housing.schema";
import {
  formatUSD,
  formatDelta,
  formatPercent,
  formatFeatureName,
} from "@/lib/utils/formatters";
import type { HousingFeatures } from "@/types/fastapi.types";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type FeatureKey = keyof HousingFeatures;

interface Scenario {
  id: string;
  label: string;
  overrides: Partial<HousingFeatures>;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: "s1",
    label: "+1 Bedroom",
    overrides: { bedrooms: (housingFeaturesDefaults.bedrooms + 1) },
  },
  {
    id: "s2",
    label: "+500 sq ft",
    overrides: {
      square_footage: housingFeaturesDefaults.square_footage + 500,
    },
  },
  {
    id: "s3",
    label: "Top school district",
    overrides: { school_rating: 9.5 },
  },
];

export function WhatIfPanel() {
  const { state, run, reset } = useWhatIf();
  const [base, setBase] = useState<HousingFeatures>(housingFeaturesDefaults);
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS);

  const addScenario = () => {
    setScenarios((prev) => [
      ...prev,
      { id: `s${Date.now()}`, label: "New scenario", overrides: {} },
    ]);
  };

  const removeScenario = (id: string) =>
    setScenarios((prev) => prev.filter((s) => s.id !== id));

  const updateScenario = (
    id: string,
    patch: Partial<Scenario>
  ) =>
    setScenarios((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );

  const setOverride = (
    id: string,
    key: FeatureKey,
    raw: string
  ) => {
    const val = raw === "" ? undefined : Number(raw);
    setScenarios((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const overrides = { ...s.overrides };
        if (val === undefined) delete overrides[key];
        else (overrides as any)[key] = val;
        return { ...s, overrides };
      })
    );
  };

  const handleRun = async () => {
    if (scenarios.length === 0) return;
    await run({
      base_features: base,
      scenarios: scenarios.map((s) => ({
        label: s.label,
        overrides: s.overrides,
      })),
    }).catch(() => {});
  };

  const featureKeys = Object.keys(fieldMeta) as FeatureKey[];

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* ── Left: config ──────────────────────────── */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        {/* Base property */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-600 text-slate-100 text-base">
                Base Property
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Starting point for all scenarios
              </p>
            </div>
            <Badge variant="slate">Base</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {featureKeys.map((key) => (
              <Input
                key={key}
                label={fieldMeta[key].label}
                unit={fieldMeta[key].unit}
                type="number"
                step={fieldMeta[key].step}
                value={base[key]}
                onChange={(e) =>
                  setBase((prev) => ({
                    ...prev,
                    [key]: Number(e.target.value),
                  }))
                }
              />
            ))}
          </div>
        </div>

        {/* Scenarios */}
        <div className="flex flex-col gap-3">
          {scenarios.map((scenario, idx) => (
            <div key={scenario.id} className="panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-slate-600 w-6">
                  S{idx + 1}
                </span>
                <input
                  value={scenario.label}
                  onChange={(e) =>
                    updateScenario(scenario.id, { label: e.target.value })
                  }
                  className="input-base text-xs flex-1 h-8"
                  placeholder="Scenario label"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={12} />}
                  onClick={() => removeScenario(scenario.id)}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                {featureKeys.map((key) => (
                  <Input
                    key={key}
                    label={fieldMeta[key].label}
                    unit={fieldMeta[key].unit}
                    type="number"
                    step={fieldMeta[key].step}
                    placeholder={String(base[key])}
                    value={
                      scenario.overrides[key] !== undefined
                        ? String(scenario.overrides[key])
                        : ""
                    }
                    onChange={(e) =>
                      setOverride(scenario.id, key, e.target.value)
                    }
                  />
                ))}
              </div>
              <p className="text-[10px] font-mono text-slate-600 mt-2">
                Leave blank to inherit base value
              </p>
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={addScenario}
              disabled={scenarios.length >= 10}
            >
              Add scenario
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Play size={13} />}
              loading={state.status === "loading"}
              onClick={handleRun}
              disabled={scenarios.length === 0}
            >
              Run analysis
            </Button>
            {state.status !== "idle" && (
              <Button variant="ghost" size="sm" onClick={reset}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {state.status === "error" && (
          <ErrorAlert message={state.message} />
        )}
      </div>

      {/* ── Right: results ────────────────────────── */}
      <div className="lg:col-span-2">
        <WhatIfResults state={state} />
      </div>
    </div>
  );
}

function WhatIfResults({ state }: { state: ReturnType<typeof useWhatIf>["state"] }) {
  if (state.status === "idle") {
    return (
      <div className="panel p-6 h-full flex flex-col items-center justify-center gap-3 text-center min-h-[340px]">
        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/30 flex items-center justify-center">
          <TrendingUp size={20} className="text-slate-600" />
        </div>
        <p className="text-sm text-slate-500">
          Configure scenarios and click{" "}
          <span className="text-amber-400 font-mono text-xs">Run analysis</span>
        </p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="panel p-6 flex flex-col gap-4 min-h-[340px]">
        <Skeleton height="h-8" className="w-1/2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="h-16" />
        ))}
      </div>
    );
  }

  if (state.status === "error") return null;

  const { data } = state;

  return (
    <div className="panel p-5 flex flex-col gap-4 animate-slide-up">
      {/* Base */}
      <div>
        <p className="text-xs font-mono text-slate-600 uppercase tracking-wider mb-2">
          Base Price
        </p>
        <p className="font-display text-3xl font-700 text-gradient-amber tabular-nums">
          {data.base_prediction.predicted_price_formatted}
        </p>
        <p className="text-xs font-mono text-slate-600 mt-1">
          model v{data.model_version}
        </p>
      </div>

      <div className="section-rule" />

      {/* Scenarios */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-mono text-slate-600 uppercase tracking-wider">
          Scenarios
        </p>
        {data.scenarios.map((s, i) => {
          const positive = s.delta_from_base > 0;
          const neutral = s.delta_from_base === 0;
          return (
            <div
              key={i}
              className={cn(
                "rounded-xl p-4 border",
                positive
                  ? "bg-emerald-500/5 border-emerald-500/15"
                  : neutral
                  ? "bg-slate-800/50 border-slate-700/30"
                  : "bg-rose-500/5 border-rose-500/15"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm text-slate-200 font-medium">{s.label}</p>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-mono font-semibold shrink-0",
                    positive
                      ? "text-emerald-400"
                      : neutral
                      ? "text-slate-400"
                      : "text-rose-400"
                  )}
                >
                  {positive ? (
                    <TrendingUp size={12} />
                  ) : neutral ? (
                    <Minus size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {formatPercent(s.delta_percent)}
                </div>
              </div>
              <p className="font-mono text-lg font-semibold text-slate-100 tabular-nums">
                {s.predicted_price_formatted}
              </p>
              <p
                className={cn(
                  "text-xs font-mono mt-0.5",
                  positive
                    ? "text-emerald-500"
                    : neutral
                    ? "text-slate-600"
                    : "text-rose-500"
                )}
              >
                {formatDelta(s.delta_from_base)} vs base
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}