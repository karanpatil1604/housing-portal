package com.housingportal.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.housingportal.model.request.HousingFeatures;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Internal DTOs that map to FastAPI response shapes.
 * Field names match the OpenAPI spec snake_case exactly.
 */
public class FastApiDtos {

    // ── POST /api/v1/predict ─────────────────────────────────────────────────

    @Data @NoArgsConstructor
    public static class SinglePredictRequest {
        private HousingFeatures features;
        public SinglePredictRequest(HousingFeatures features) { this.features = features; }
    }

    @Data @NoArgsConstructor
    public static class SinglePredictResponse {
        @JsonProperty("predicted_price")
        private double predictedPrice;
        @JsonProperty("predicted_price_formatted")
        private String predictedPriceFormatted;
        @JsonProperty("model_version")
        private String modelVersion;
        @JsonProperty("features_received")
        private HousingFeatures featuresReceived;
    }

    // ── POST /api/v1/predict/batch ───────────────────────────────────────────

    @Data @NoArgsConstructor
    public static class BatchPredictRequest {
        private List<HousingFeatures> features;
        public BatchPredictRequest(List<HousingFeatures> features) { this.features = features; }
    }

    @Data @NoArgsConstructor
    public static class BatchPredictResponse {
        private int count;
        private List<PredictionResult> predictions;
        @JsonProperty("model_version")
        private String modelVersion;
    }

    @Data @NoArgsConstructor
    public static class PredictionResult {
        @JsonProperty("predicted_price")
        private double predictedPrice;
        @JsonProperty("predicted_price_formatted")
        private String predictedPriceFormatted;
    }

    // ── GET /api/v1/model-info ───────────────────────────────────────────────

    @Data @NoArgsConstructor
    public static class ModelInfoResponse {
        @JsonProperty("model_name")
        private String modelName;
        @JsonProperty("model_version")
        private String modelVersion;
        private String algorithm;
        @JsonProperty("feature_names")
        private List<String> featureNames;
        @JsonProperty("feature_importances")
        private List<FeatureImportance> featureImportances;
        private double intercept;
        private ModelMetrics metrics;
        @JsonProperty("training_data_path")
        private String trainingDataPath;
        @JsonProperty("is_trained")
        private boolean isTrained;
    }

    @Data @NoArgsConstructor
    public static class FeatureImportance {
        private String feature;
        private double coefficient;
        @JsonProperty("abs_importance")
        private double absImportance;
    }

    @Data @NoArgsConstructor
    public static class ModelMetrics {
        @JsonProperty("r2_score")
        private double r2Score;
        private double mae;
        private double rmse;
        private double mape;
        @JsonProperty("train_samples")
        private int trainSamples;
        @JsonProperty("test_samples")
        private int testSamples;
    }

    // ── GET /api/v1/health ───────────────────────────────────────────────────

    @Data @NoArgsConstructor
    public static class HealthResponse {
        private String status;
        private String version;
        private String environment;
        @JsonProperty("model_loaded")
        private boolean modelLoaded;
        @JsonProperty("uptime_seconds")
        private double uptimeSeconds;
    }
}