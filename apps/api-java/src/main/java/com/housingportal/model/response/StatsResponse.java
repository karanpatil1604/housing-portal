package com.housingportal.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

// ── Market Stats ──────────────────────────────────────────────────────────────

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {

    @JsonProperty("total_properties")
    private long totalProperties;

    @JsonProperty("avg_price")
    private double avgPrice;

    @JsonProperty("avg_price_formatted")
    private String avgPriceFormatted;

    @JsonProperty("median_price")
    private double medianPrice;

    @JsonProperty("median_price_formatted")
    private String medianPriceFormatted;

    @JsonProperty("price_range")
    private PriceRange priceRange;

    @JsonProperty("avg_square_footage")
    private double avgSquareFootage;

    @JsonProperty("avg_year_built")
    private double avgYearBuilt;

    @JsonProperty("avg_school_rating")
    private double avgSchoolRating;

    @JsonProperty("price_per_sqft")
    private double pricePerSqft;

    @JsonProperty("updated_at")
    private String updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceRange {
        private double min;
        private double max;
    }
}