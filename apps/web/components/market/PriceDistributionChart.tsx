"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { formatUSD } from "@/lib/utils/formatters";

// Representative sample data for visualisation
const SAMPLE_DATA = [
  { sqft: 850,  price: 165000,  beds: 1 },
  { sqft: 1050, price: 198000,  beds: 2 },
  { sqft: 1200, price: 232000,  beds: 2 },
  { sqft: 1350, price: 258000,  beds: 3 },
  { sqft: 1500, price: 287000,  beds: 3 },
  { sqft: 1600, price: 308000,  beds: 3 },
  { sqft: 1750, price: 334000,  beds: 3 },
  { sqft: 1850, price: 356000,  beds: 3 },
  { sqft: 1950, price: 378000,  beds: 4 },
  { sqft: 2100, price: 402000,  beds: 4 },
  { sqft: 2200, price: 428000,  beds: 4 },
  { sqft: 2350, price: 456000,  beds: 4 },
  { sqft: 2500, price: 485000,  beds: 4 },
  { sqft: 2700, price: 518000,  beds: 5 },
  { sqft: 2900, price: 554000,  beds: 5 },
  { sqft: 3100, price: 590000,  beds: 5 },
  { sqft: 3300, price: 628000,  beds: 5 },
  { sqft: 3500, price: 668000,  beds: 5 },
  { sqft: 3700, price: 710000,  beds: 6 },
  { sqft: 3900, price: 755000,  beds: 6 },
  { sqft: 4200, price: 812000,  beds: 6 },
  { sqft: 4500, price: 872000,  beds: 6 },
  { sqft: 5000, price: 962000,  beds: 7 },
  { sqft: 5500, price: 1055000, beds: 7 },
  { sqft: 6000, price: 1148000, beds: 8 },
];

function TooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-lg p-3 shadow-panel text-xs font-mono">
      <p className="text-amber-400 font-semibold">{formatUSD(d.price)}</p>
      <p className="text-slate-400">{d.sqft.toLocaleString()} sqft</p>
      <p className="text-slate-500">{d.beds} bedrooms</p>
    </div>
  );
}

export function PriceDistributionChart() {
  return (
    <div className="panel p-6">
      <div className="mb-4">
        <h3 className="font-display font-600 text-slate-100 text-base">
          Price vs Square Footage
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          ML-predicted prices across property sizes
        </p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="sqft"
            type="number"
            name="Sq Ft"
            domain={["dataMin - 100", "dataMax + 100"]}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            tick={{ fill: "#5C7FA8", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            label={{
              value: "sq ft",
              position: "insideBottomRight",
              offset: -4,
              fill: "#3D5A80",
              fontSize: 10,
              fontFamily: "monospace",
            }}
          />
          <YAxis
            dataKey="price"
            type="number"
            name="Price"
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: "#5C7FA8", fontSize: 10, fontFamily: "monospace" }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <ZAxis range={[40, 40]} />
          <Tooltip content={<TooltipContent />} cursor={{ strokeDasharray: "3 3", stroke: "#2A3F5F" }} />
          <Scatter
            data={SAMPLE_DATA}
            fill="rgba(251,183,36,0.65)"
            stroke="rgba(251,183,36,0.9)"
            strokeWidth={1}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}