package com.housingportal.model.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FiltersResponse {

    private List<FilterOption> bedrooms;
    private List<FilterOption> bathrooms;

    @JsonProperty("year_built_ranges")
    private List<FilterOption> yearBuiltRanges;

    @JsonProperty("distance_ranges")
    private List<FilterOption> distanceRanges;

    @JsonProperty("school_rating_ranges")
    private List<FilterOption> schoolRatingRanges;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FilterOption {
        private String value;
        private String label;
        private Integer count;
    }
}