import { cn } from "@/lib/utils/cn";

// ── Card ─────────────────────────────────────────────────────
interface CardProps {
  className?: string;
  children: React.ReactNode;
  noPad?: boolean;
}
export function Card({ className, children, noPad }: CardProps) {
  return (
    <div className={cn("panel", !noPad && "p-5", className)}>{children}</div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("border-b border-slate-700/40 pb-4 mb-5", className)}>
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────
type BadgeVariant = "amber" | "emerald" | "rose" | "slate" | "blue";

const badgeStyles: Record<BadgeVariant, string> = {
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  slate: "bg-slate-700/50 text-slate-400 border-slate-600/30",
  blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
};

export function Badge({
  variant = "slate",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono border",
        badgeStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" }[size];
  return (
    <div
      className={cn(
        "rounded-full border-2 border-slate-700 border-t-amber-400 animate-spin",
        s
      )}
      role="status"
    />
  );
}

// ── Skeleton ──────────────────────────────────────────────────
export function Skeleton({
  className,
  height = "h-4",
}: {
  className?: string;
  height?: string;
}) {
  return <div className={cn("skeleton", height, className)} />;
}

// ── Stat Card ─────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="card p-4">
      <p className="stat-label">{label}</p>
      <p className={cn("stat-value mt-1", !accent && "text-slate-100 text-xl")}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1 font-mono">{sub}</p>}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      {icon && <div className="text-slate-600 mb-1">{icon}</div>}
      <p className="text-slate-300 font-medium">{title}</p>
      {description && (
        <p className="text-sm text-slate-500 max-w-xs">{description}</p>
      )}
    </div>
  );
}