package com.housingportal.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.housingportal.model.request.HousingFeatures;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhatIfResponse {

    @JsonProperty("base_prediction")
    private PredictionResult basePrediction;

    private List<ScenarioResult> scenarios;

    @JsonProperty("model_version")
    private String modelVersion;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionResult {

        @JsonProperty("predicted_price")
        private double predictedPrice;

        @JsonProperty("predicted_price_formatted")
        private String predictedPriceFormatted;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScenarioResult {

        private String label;
        private HousingFeatures features;

        @JsonProperty("predicted_price")
        private double predictedPrice;

        @JsonProperty("predicted_price_formatted")
        private String predictedPriceFormatted;

        @JsonProperty("delta_from_base")
        private double deltaFromBase;

        @JsonProperty("delta_percent")
        private double deltaPercent;
    }
}