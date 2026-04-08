import { cn } from "@/lib/utils/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-2xl font-700 text-slate-50 tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

// Sub-nav tabs used within Estimator / Market sections
interface TabsProps {
  tabs: { label: string; href: string }[];
  activeHref: string;
}

export function SubNav({ tabs, activeHref }: TabsProps) {
  return (
    <nav className="flex items-center gap-1 border-b border-slate-700/40 mb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 overflow-x-auto no-scrollbar">
      {tabs.map(({ label, href }) => (
        <a
          key={href}
          href={href}
          className={cn(
            "px-3 py-2.5 text-sm whitespace-nowrap border-b-2 transition-all duration-150",
            activeHref === href
              ? "border-amber-400 text-amber-400 font-medium"
              : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}