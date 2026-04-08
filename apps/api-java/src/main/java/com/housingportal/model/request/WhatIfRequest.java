package com.housingportal.model.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WhatIfRequest {

    @NotNull @Valid
    private HousingFeatures baseFeatures;

    @NotEmpty
    @Size(min = 1, max = 10)
    private List<WhatIfScenario> scenarios;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WhatIfScenario {

        @NotNull
        @Size(min = 1, max = 100)
        private String label;

        /** Partial overrides applied on top of baseFeatures */
        @NotNull @Valid
        private ScenarioOverrides overrides;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScenarioOverrides {
        private Integer squareFootage;
        private Integer bedrooms;
        private Double bathrooms;
        private Integer yearBuilt;
        private Integer lotSize;
        private Double distanceToCityCenter;
        private Double schoolRating;
    }
}