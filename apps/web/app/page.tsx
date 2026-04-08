import Link from "next/link";
import { Building2, BarChart3, ArrowRight, Zap, Database, Brain } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 animate-fade-in">
      {/* Hero */}
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/8 border border-amber-500/20 text-amber-400 text-xs font-mono mb-6">
          <Zap size={11} />
          ML-Powered Property Intelligence
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-800 text-slate-50 tracking-tight leading-none mb-4">
          Housing{" "}
          <span className="text-gradient-amber">Portal</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Predict property values and analyse market trends using a
          production-grade machine learning API.
        </p>
      </div>

      {/* App cards */}
      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
        <Link
          href="/estimator"
          className="panel p-6 group hover:border-amber-500/30 hover:shadow-glow-sm transition-all duration-200 flex flex-col gap-4"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
              <Building2 size={18} className="text-amber-400" />
            </div>
            <ArrowRight
              size={16}
              className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all"
            />
          </div>
          <div>
            <h2 className="font-display font-600 text-slate-100 text-lg mb-1">
              Property Estimator
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Single &amp; batch price predictions. History tracking and
              side-by-side comparison.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-slate-700/40">
            {["Predict", "Batch", "History", "Compare"].map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded border border-slate-700/40"
              >
                {tag}
              </span>
            ))}
          </div>
        </Link>

        <Link
          href="/market"
          className="panel p-6 group hover:border-amber-500/30 hover:shadow-glow-sm transition-all duration-200 flex flex-col gap-4"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/15 transition-colors">
              <BarChart3 size={18} className="text-blue-400" />
            </div>
            <ArrowRight
              size={16}
              className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
            />
          </div>
          <div>
            <h2 className="font-display font-600 text-slate-100 text-lg mb-1">
              Market Analysis
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Dashboard charts, filters, what-if scenario modelling, and CSV /
              PDF export.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-slate-700/40">
            {["Dashboard", "Filters", "What-If", "Export"].map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded border border-slate-700/40"
              >
                {tag}
              </span>
            ))}
          </div>
        </Link>
      </div>

      {/* Tech stack strip */}
      <div className="flex items-center gap-6 text-slate-700">
        {[
          { icon: Brain, label: "scikit-learn ML" },
          { icon: Zap, label: "FastAPI" },
          { icon: Database, label: "Spring Boot" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Icon size={13} />
            <span className="text-xs font-mono">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}