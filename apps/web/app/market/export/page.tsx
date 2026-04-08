import type { Metadata } from "next";
import { ExportButton } from "@/components/market/ExportButton";
import { Card } from "@/components/ui/Card";
import { FileText, Info } from "lucide-react";

export const metadata: Metadata = { title: "Export Data" };

export default function ExportPage() {
  const csvColumns = [
    { name: "square_footage", desc: "Total liveable area (sq ft)" },
    { name: "bedrooms", desc: "Number of bedrooms" },
    { name: "bathrooms", desc: "Number of bathrooms" },
    { name: "year_built", desc: "Year constructed" },
    { name: "lot_size", desc: "Lot area (sq ft)" },
    { name: "distance_to_city_center", desc: "Distance to city (miles)" },
    { name: "school_rating", desc: "School quality rating (0–10)" },
    { name: "predicted_price", desc: "ML-predicted price (USD)" },
    { name: "predicted_price_formatted", desc: "Human-readable price" },
  ];

  return (
    <div className="animate-slide-up max-w-2xl flex flex-col gap-6">
      <div>
        <h2 className="font-display font-600 text-slate-100 text-lg">
          Export Market Data
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Downloads a CSV of representative property data with ML-predicted
          prices from{" "}
          <code className="font-mono text-xs text-slate-400">
            GET /api/analysis/export?format=csv
          </code>
        </p>
      </div>

      {/* Export card */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileText size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                housing_market_export.csv
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                25 properties · 9 columns · ML predictions
              </p>
            </div>
          </div>
          <ExportButton />
        </div>
      </Card>

      {/* Column reference */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Info size={13} className="text-slate-500" />
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500">
            CSV Columns
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/40">
              <th className="pb-2 text-left text-[10px] font-mono uppercase tracking-wider text-slate-600">
                Column
              </th>
              <th className="pb-2 text-left text-[10px] font-mono uppercase tracking-wider text-slate-600">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {csvColumns.map(({ name, desc }) => (
              <tr
                key={name}
                className="border-b border-slate-700/20 last:border-0"
              >
                <td className="py-2 pr-4 font-mono text-xs text-amber-400/80 whitespace-nowrap">
                  {name}
                </td>
                <td className="py-2 text-xs text-slate-500">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}