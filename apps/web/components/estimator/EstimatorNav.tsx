"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { label: "Predict", href: "/estimator" },
  { label: "Batch", href: "/estimator/batch" },
  { label: "History", href: "/estimator/history" },
  { label: "Compare", href: "/estimator/compare" },
];

export function EstimatorNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 border-b border-slate-700/40 mb-8 overflow-x-auto no-scrollbar">
      {tabs.map(({ label, href }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-3 py-2.5 text-sm whitespace-nowrap border-b-2 transition-all duration-150",
              active
                ? "border-amber-400 text-amber-400 font-medium"
                : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}