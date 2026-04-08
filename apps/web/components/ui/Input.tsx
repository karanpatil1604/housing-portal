import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

// ── Input ─────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  unit?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, unit, error, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="label-base">
          {label}
          {hint && (
            <span className="ml-1.5 text-slate-600 normal-case tracking-normal font-sans">
              · {hint}
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "input-base",
            unit && "pr-12",
            error && "border-rose-500/60 focus:ring-rose-500/40 focus:border-rose-500/60",
            className
          )}
          {...props}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-400 font-mono mt-0.5">{error}</p>
      )}
    </div>
  );
});

// ── Select ────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="label-base">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "input-base appearance-none cursor-pointer",
          error && "border-rose-500/60",
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-rose-400 font-mono mt-0.5">{error}</p>
      )}
    </div>
  );
}