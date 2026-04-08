// ============================================================
// Java Spring Boot API Types
// ============================================================

export interface MarketStats {
  total_properties: number;
  avg_price: number;
  avg_price_formatted: string;
  median_price: number;
  median_price_formatted: string;
  price_range: { min: number; max: number };
  avg_square_footage: number;
  avg_year_built: number;
  avg_school_rating: number;
  price_per_sqft: number;
  updated_at: string; // ISO timestamp
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface MarketFilters {
  bedrooms: FilterOption[];
  bathrooms: FilterOption[];
  year_built_ranges: FilterOption[];
  distance_ranges: FilterOption[];
  school_rating_ranges: FilterOption[];
}

export interface WhatIfRequest {
  base_features: import("./fastapi.types").HousingFeatures;
  scenarios: Array<{
    label: string;
    overrides: Partial<import("./fastapi.types").HousingFeatures>;
  }>;
}

export interface WhatIfScenarioResult {
  label: string;
  features: import("./fastapi.types").HousingFeatures;
  predicted_price: number;
  predicted_price_formatted: string;
  delta_from_base: number;
  delta_percent: number;
}

export interface WhatIfResponse {
  base_prediction: import("./fastapi.types").PredictionResult;
  scenarios: WhatIfScenarioResult[];
  model_version: string;
}

export interface ExportParams {
  format: "csv" | "pdf";
  filters?: Record<string, string | number>;
}