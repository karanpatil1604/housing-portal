// ============================================================
// Formatters — currency, numbers, dates, percentages
// ============================================================

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUSDFull(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatDelta(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatUSD(value)}`;
}

export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function formatFeatureName(key: string): string {
  const map: Record<string, string> = {
    square_footage: "Sq Footage",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    year_built: "Year Built",
    lot_size: "Lot Size",
    distance_to_city_center: "City Distance",
    school_rating: "School Rating",
  };
  return map[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function classifyPriceChange(delta: number): "positive" | "negative" | "neutral" {
  if (delta > 0) return "positive";
  if (delta < 0) return "negative";
  return "neutral";
}