// Mirrors OpenAPI spec — DO NOT modify field names

export interface HousingFeatures {
  square_footage: number;       // int, > 0, <= 50000
  bedrooms: number;             // int, 0–20
  bathrooms: number;            // float, 0–20, 0.5 increments
  year_built: number;           // int, 1800–2100
  lot_size: number;             // int, > 0, <= 5000000
  distance_to_city_center: number; // float, 0–500
  school_rating: number;        // float, 0–10
}

export interface SinglePredictRequest {
  features: HousingFeatures;
}

export interface PredictionResult {
  predicted_price: number;
  predicted_price_formatted: string; // e.g. "$265,432.00"
}

export interface SinglePredictResponse extends PredictionResult {
  model_version: string;
  features_received: HousingFeatures;
}

export interface BatchPredictRequest {
  features: HousingFeatures[];  // minItems: 1
}

export interface BatchPredictResponse {
  count: number;
  predictions: PredictionResult[];
  model_version: string;
}

export interface FeatureImportance {
  feature: string;
  coefficient: number;
  abs_importance: number;
}

export interface ModelMetrics {
  r2_score: number;
  mae: number;             // USD
  rmse: number;            // USD
  mape: number;            // 0–100
  train_samples: number;
  test_samples: number;
}

export interface ModelInfoResponse {
  model_name: string;
  model_version: string;
  algorithm: string;
  feature_names: string[];
  feature_importances: FeatureImportance[];
  intercept: number;
  metrics: ModelMetrics;
  training_data_path: string;
  is_trained: boolean;
}

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface HealthResponse {
  status: HealthStatus;
  version: string;
  environment: string;
  model_loaded: boolean;
  uptime_seconds: number;
}
