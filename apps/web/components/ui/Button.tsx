import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variants = {
  primary:
    "bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-glow-sm hover:shadow-glow-amber border border-amber-400/30",
  secondary:
    "bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600/60 hover:border-slate-500",
  ghost:
    "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700/40",
  danger:
    "bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-600/30 hover:border-rose-500/50",
};

const sizes = {
  sm: "h-7 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={14} />
      ) : (
        icon && iconPosition === "left" && (
          <span className="shrink-0">{icon}</span>
        )
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
}