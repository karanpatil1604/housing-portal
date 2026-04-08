"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Building2, BarChart3, Activity } from "lucide-react";
import { HealthStatusDot } from "./HealthStatusDot";

const navItems = [
  {
    label: "Estimator",
    href: "/estimator",
    icon: Building2,
    description: "Price predictions",
  },
  {
    label: "Market Analysis",
    href: "/market",
    icon: BarChart3,
    description: "Analytics & insights",
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-slate-700/50 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Building2 size={14} className="text-amber-400" />
          </div>
          <span className="font-display font-700 text-slate-100 tracking-tight text-sm hidden sm:block">
            HousingPortal
          </span>
          <span className="font-mono text-[10px] text-slate-600 border border-slate-700/50 rounded px-1 py-0.5 hidden md:block">
            v1.0
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
                  active
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"
                )}
              >
                <Icon size={14} />
                <span className="hidden sm:block">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Health indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <HealthStatusDot />
          <div className="h-4 w-px bg-slate-700/60" />
          <Activity size={14} className="text-slate-600" />
        </div>
      </div>
    </header>
  );
}