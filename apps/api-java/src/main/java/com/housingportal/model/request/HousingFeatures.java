package com.housingportal.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Feature vector for a single property.
 * Field names MUST match the FastAPI OpenAPI spec exactly.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HousingFeatures {

    @NotNull
    @Positive
    @Max(50000)
    @JsonProperty("square_footage")
    private Integer squareFootage;

    @NotNull
    @Min(0) @Max(20)
    private Integer bedrooms;

    @NotNull
    @DecimalMin("0.0") @DecimalMax("20.0")
    private Double bathrooms;

    @NotNull
    @Min(1800) @Max(2100)
    @JsonProperty("year_built")
    private Integer yearBuilt;

    @NotNull
    @Positive
    @Max(5_000_000)
    @JsonProperty("lot_size")
    private Integer lotSize;

    @NotNull
    @DecimalMin("0.0") @DecimalMax("500.0")
    @JsonProperty("distance_to_city_center")
    private Double distanceToCityCenter;

    @NotNull
    @DecimalMin("0.0") @DecimalMax("10.0")
    @JsonProperty("school_rating")
    private Double schoolRating;
}