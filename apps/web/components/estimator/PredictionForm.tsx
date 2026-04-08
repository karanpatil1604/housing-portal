"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  housingFeaturesSchema,
  housingFeaturesDefaults,
  fieldMeta,
  type HousingFeaturesForm,
} from "@/lib/validations/housing.schema";
import { usePrediction } from "@/hooks/usePrediction";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorBoundary";
import { PredictionResult } from "./PredictionResult";
import { Sparkles, RotateCcw } from "lucide-react";

export function PredictionForm() {
  const { state, predict, reset } = usePrediction();
  const [label, setLabel] = useState("");

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<HousingFeaturesForm>({
    resolver: zodResolver(housingFeaturesSchema),
    defaultValues: housingFeaturesDefaults,
  });

  const onSubmit = async (values: HousingFeaturesForm) => {
    await predict(values, label || undefined).catch(() => {});
  };

  const handleReset = () => {
    resetForm(housingFeaturesDefaults);
    reset();
    setLabel("");
  };

  const fields = Object.keys(fieldMeta) as (keyof HousingFeaturesForm)[];

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* ── Form panel ─────────────────────────────── */}
      <div className="lg:col-span-3 panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-600 text-slate-100 text-base">
              Property Features
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              POST /api/v1/predict
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Optional label */}
          <div className="mb-5">
            <Input
              label="Label (optional)"
              placeholder="e.g. My dream home"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="section-rule" />

          {/* Feature grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {fields.map((key) => {
              const meta = fieldMeta[key];
              return (
                <Input
                  key={key}
                  label={meta.label}
                  hint={meta.hint}
                  unit={meta.unit}
                  type="number"
                  step={meta.step}
                  error={errors[key]?.message}
                  {...register(key, { valueAsNumber: true })}
                />
              );
            })}
          </div>

          {state.status === "error" && (
            <div className="mb-4">
              <ErrorAlert message={state.message} />
            </div>
          )}

          <Button
            type="submit"
            loading={state.status === "loading"}
            icon={<Sparkles size={14} />}
            className="w-full"
            size="lg"
          >
            {state.status === "loading" ? "Predicting…" : "Predict Price"}
          </Button>
        </form>
      </div>

      {/* ── Result panel ───────────────────────────── */}
      <div className="lg:col-span-2">
        <PredictionResult state={state} />
      </div>
    </div>
  );
}