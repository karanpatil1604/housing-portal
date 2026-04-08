"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { useBatchPrediction } from "@/hooks/useBatchPrediction";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorBoundary";
import { Badge, Skeleton } from "@/components/ui/Card";
import { formatUSD, formatFeatureName } from "@/lib/utils/formatters";
import { housingFeaturesSchema } from "@/lib/validations/housing.schema";
import type { HousingFeatures } from "@/types/fastapi.types";
import {
  Upload,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const CSV_HEADERS: (keyof HousingFeatures)[] = [
  "square_footage",
  "bedrooms",
  "bathrooms",
  "year_built",
  "lot_size",
  "distance_to_city_center",
  "school_rating",
];

const SAMPLE_CSV = [
  CSV_HEADERS.join(","),
  "1850,3,2,2005,6500,4.5,8.2",
  "2400,4,3,2010,8200,2.1,9.0",
  "1200,2,1,1995,4000,7.8,6.5",
].join("\n");

function downloadSample() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample_batch.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function BatchUploadForm() {
  const { state, predict, reset } = useBatchPrediction();
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const [features, setFeatures] = useState<HousingFeatures[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setParseError(null);
    setParsedCount(null);
    reset();

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) {
          setParseError(`CSV parse error: ${errors[0].message}`);
          return;
        }
        const parsed: HousingFeatures[] = [];
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const obj = {
            square_footage: Number(row.square_footage),
            bedrooms: Number(row.bedrooms),
            bathrooms: Number(row.bathrooms),
            year_built: Number(row.year_built),
            lot_size: Number(row.lot_size),
            distance_to_city_center: Number(row.distance_to_city_center),
            school_rating: Number(row.school_rating),
          };
          const result = housingFeaturesSchema.safeParse(obj);
          if (!result.success) {
            setParseError(
              `Row ${i + 2}: ${result.error.errors[0].message}`
            );
            return;
          }
          parsed.push(obj);
        }
        setFeatures(parsed);
        setParsedCount(parsed.length);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
    else setParseError("Please upload a .csv file");
  };

  const handleSubmit = async () => {
    if (features.length === 0) return;
    await predict(features).catch(() => {});
  };

  const exportResults = () => {
    if (state.status !== "success") return;
    const rows = [
      [...CSV_HEADERS, "predicted_price", "predicted_price_formatted"].join(","),
      ...state.rows.map((r) => [
        ...CSV_HEADERS.map((k) => r.features[k]),
        r.result?.predicted_price ?? "",
        r.result?.predicted_price_formatted ?? "",
      ].join(",")),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch_predictions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Upload zone */}
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-600 text-slate-100 text-base">
              Batch Prediction
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              POST /api/v1/predict/batch
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<Download size={13} />}
            onClick={downloadSample}
          >
            Sample CSV
          </Button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-slate-700/60 hover:border-amber-500/40 rounded-xl p-10
                     flex flex-col items-center gap-3 cursor-pointer transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/40 flex items-center justify-center group-hover:border-amber-500/30 transition-colors">
            <Upload size={20} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-300">
              Drop a CSV or{" "}
              <span className="text-amber-400">click to browse</span>
            </p>
            <p className="text-xs text-slate-600 mt-1 font-mono">
              Columns: {CSV_HEADERS.join(", ")}
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {parseError && (
          <div className="mt-4">
            <ErrorAlert message={parseError} />
          </div>
        )}

        {parsedCount !== null && !parseError && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 size={15} />
              <span className="font-mono">
                {parsedCount} valid rows parsed
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              loading={state.status === "loading"}
              size="md"
            >
              Run Batch ({parsedCount})
            </Button>
          </div>
        )}

        {state.status === "error" && (
          <div className="mt-4">
            <ErrorAlert message={state.message} />
          </div>
        )}
      </div>

      {/* Results table */}
      {state.status === "loading" && (
        <div className="panel p-6 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="h-10" />
          ))}
        </div>
      )}

      {state.status === "success" && (
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/40">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-600 text-slate-100 text-base">
                Results
              </h3>
              <Badge variant="emerald">{state.data.count} predictions</Badge>
              <Badge variant="slate">v{state.data.model_version}</Badge>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={13} />}
              onClick={exportResults}
            >
              Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-wider text-slate-600">
                    #
                  </th>
                  {CSV_HEADERS.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-right text-[10px] font-mono uppercase tracking-wider text-slate-600"
                    >
                      {formatFeatureName(h)}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-[10px] font-mono uppercase tracking-wider text-amber-600">
                    Predicted
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.rows.map((row) => (
                  <tr
                    key={row.index}
                    className="border-b border-slate-700/20 hover:bg-slate-800/30"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-600">
                      {row.index + 1}
                    </td>
                    {CSV_HEADERS.map((k) => (
                      <td
                        key={k}
                        className="px-4 py-2.5 text-right font-mono text-xs text-slate-400 tabular-nums"
                      >
                        {row.features[k]}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right font-mono text-sm text-amber-400 font-semibold tabular-nums">
                      {row.result?.predicted_price_formatted ?? (
                        <XCircle size={14} className="text-rose-400 ml-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}