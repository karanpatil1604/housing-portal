package com.housingportal.service;

import com.housingportal.model.request.HousingFeatures;
import com.housingportal.model.request.WhatIfRequest;
import com.housingportal.model.response.FastApiDtos;
import com.housingportal.model.response.FiltersResponse;
import com.housingportal.model.response.FiltersResponse.FilterOption;
import com.housingportal.model.response.StatsResponse;
import com.housingportal.model.response.WhatIfResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisService {

    private final FastApiClient fastApiClient;

    private static final NumberFormat USD_FORMAT =
            NumberFormat.getCurrencyInstance(Locale.US);

    // ── GET /api/analysis/stats ──────────────────────────────────────────────

    /**
     * Returns aggregated market stats.
     * Calls FastAPI batch endpoint with a representative sample of
     * synthetic properties to derive market-wide statistics.
     * Cached for 60 seconds.
     */
    @Cacheable("marketStats")
    public StatsResponse getMarketStats() {
        log.debug("Computing market stats (cache miss)");

        // Build a diverse sample covering the feature space
        List<HousingFeatures> sampleProperties = buildRepresentativeSample();
        FastApiDtos.BatchPredictResponse batchResponse =
                fastApiClient.predictBatch(sampleProperties);

        List<Double> prices = batchResponse.getPredictions().stream()
                .map(FastApiDtos.PredictionResult::getPredictedPrice)
                .sorted()
                .collect(Collectors.toList());

        double avg = prices.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double median = computeMedian(prices);
        double min = prices.isEmpty() ? 0 : prices.get(0);
        double max = prices.isEmpty() ? 0 : prices.get(prices.size() - 1);

        // Avg features from sample
        double avgSqft = sampleProperties.stream()
                .mapToInt(HousingFeatures::getSquareFootage).average().orElse(0);
        double avgYearBuilt = sampleProperties.stream()
                .mapToInt(HousingFeatures::getYearBuilt).average().orElse(0);
        double avgSchoolRating = sampleProperties.stream()
                .mapToDouble(HousingFeatures::getSchoolRating).average().orElse(0);
        double pricePerSqft = avg / avgSqft;

        return StatsResponse.builder()
                .totalProperties((long) prices.size())
                .avgPrice(avg)
                .avgPriceFormatted(USD_FORMAT.format(avg))
                .medianPrice(median)
                .medianPriceFormatted(USD_FORMAT.format(median))
                .priceRange(StatsResponse.PriceRange.builder().min(min).max(max).build())
                .avgSquareFootage(avgSqft)
                .avgYearBuilt(avgYearBuilt)
                .avgSchoolRating(avgSchoolRating)
                .pricePerSqft(pricePerSqft)
                .updatedAt(Instant.now().toString())
                .build();
    }

    // ── GET /api/analysis/filters ────────────────────────────────────────────

    @Cacheable("marketFilters")
    public FiltersResponse getMarketFilters() {
        log.debug("Building market filters (cache miss)");

        return FiltersResponse.builder()
                .bedrooms(List.of(
                        opt("1", "1 Bed"),
                        opt("2", "2 Beds"),
                        opt("3", "3 Beds"),
                        opt("4", "4 Beds"),
                        opt("5", "5+ Beds")))
                .bathrooms(List.of(
                        opt("1.0", "1 Bath"),
                        opt("1.5", "1.5 Baths"),
                        opt("2.0", "2 Baths"),
                        opt("2.5", "2.5 Baths"),
                        opt("3.0", "3+ Baths")))
                .yearBuiltRanges(List.of(
                        opt("before_1980", "Before 1980"),
                        opt("1980_2000", "1980–2000"),
                        opt("2000_2010", "2000–2010"),
                        opt("2010_2020", "2010–2020"),
                        opt("after_2020", "After 2020")))
                .distanceRanges(List.of(
                        opt("0_2", "< 2 miles"),
                        opt("2_5", "2–5 miles"),
                        opt("5_10", "5–10 miles"),
                        opt("10_plus", "10+ miles")))
                .schoolRatingRanges(List.of(
                        opt("0_4", "0–4 (Below avg)"),
                        opt("4_7", "4–7 (Average)"),
                        opt("7_9", "7–9 (Good)"),
                        opt("9_10", "9–10 (Excellent)")))
                .build();
    }

    // ── POST /api/analysis/what-if ───────────────────────────────────────────

    public WhatIfResponse runWhatIf(WhatIfRequest request) {
        log.debug("Running what-if analysis with {} scenarios",
                request.getScenarios().size());

        // Build feature list: base + all scenario overrides
        List<HousingFeatures> batchFeatures = new ArrayList<>();
        batchFeatures.add(request.getBaseFeatures()); // index 0 = base

        for (WhatIfRequest.WhatIfScenario scenario : request.getScenarios()) {
            batchFeatures.add(applyOverrides(
                    request.getBaseFeatures(), scenario.getOverrides()));
        }

        // Single batch call to FastAPI
        FastApiDtos.BatchPredictResponse batchResponse =
                fastApiClient.predictBatch(batchFeatures);

        FastApiDtos.PredictionResult basePrediction =
                batchResponse.getPredictions().get(0);
        double basePrice = basePrediction.getPredictedPrice();

        List<WhatIfResponse.ScenarioResult> scenarioResults = new ArrayList<>();
        for (int i = 0; i < request.getScenarios().size(); i++) {
            FastApiDtos.PredictionResult pred =
                    batchResponse.getPredictions().get(i + 1);
            double delta = pred.getPredictedPrice() - basePrice;
            double deltaPct = basePrice > 0 ? (delta / basePrice) * 100 : 0;

            scenarioResults.add(WhatIfResponse.ScenarioResult.builder()
                    .label(request.getScenarios().get(i).getLabel())
                    .features(batchFeatures.get(i + 1))
                    .predictedPrice(pred.getPredictedPrice())
                    .predictedPriceFormatted(pred.getPredictedPriceFormatted())
                    .deltaFromBase(delta)
                    .deltaPercent(Math.round(deltaPct * 100.0) / 100.0)
                    .build());
        }

        return WhatIfResponse.builder()
                .basePrediction(WhatIfResponse.PredictionResult.builder()
                        .predictedPrice(basePrediction.getPredictedPrice())
                        .predictedPriceFormatted(basePrediction.getPredictedPriceFormatted())
                        .build())
                .scenarios(scenarioResults)
                .modelVersion(batchResponse.getModelVersion())
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private HousingFeatures applyOverrides(
            HousingFeatures base, WhatIfRequest.ScenarioOverrides ov) {
        return HousingFeatures.builder()
                .squareFootage(ov.getSquareFootage() != null
                        ? ov.getSquareFootage() : base.getSquareFootage())
                .bedrooms(ov.getBedrooms() != null
                        ? ov.getBedrooms() : base.getBedrooms())
                .bathrooms(ov.getBathrooms() != null
                        ? ov.getBathrooms() : base.getBathrooms())
                .yearBuilt(ov.getYearBuilt() != null
                        ? ov.getYearBuilt() : base.getYearBuilt())
                .lotSize(ov.getLotSize() != null
                        ? ov.getLotSize() : base.getLotSize())
                .distanceToCityCenter(ov.getDistanceToCityCenter() != null
                        ? ov.getDistanceToCityCenter() : base.getDistanceToCityCenter())
                .schoolRating(ov.getSchoolRating() != null
                        ? ov.getSchoolRating() : base.getSchoolRating())
                .build();
    }

    private double computeMedian(List<Double> sorted) {
        if (sorted.isEmpty()) return 0;
        int mid = sorted.size() / 2;
        return sorted.size() % 2 == 0
                ? (sorted.get(mid - 1) + sorted.get(mid)) / 2.0
                : sorted.get(mid);
    }

    private FilterOption opt(String value, String label) {
        return FilterOption.builder().value(value).label(label).build();
    }

    /**
     * Builds a representative grid of properties covering
     * different bedroom counts, sizes, ages, locations, and school ratings.
     * These are sent to FastAPI batch to derive market-level statistics.
     */
    private List<HousingFeatures> buildRepresentativeSample() {
        int[] sqfts = {900, 1200, 1500, 1800, 2100, 2400, 2800, 3200, 3800, 4500};
        int[] beds = {1, 2, 2, 3, 3, 4, 4, 5, 5, 6};
        double[] baths = {1.0, 1.5, 2.0, 2.0, 2.5, 3.0, 3.0, 3.5, 4.0, 4.5};
        int[] years = {1975, 1985, 1990, 1995, 2000, 2005, 2008, 2012, 2017, 2022};
        int[] lots = {3500, 4500, 5500, 6000, 7000, 7500, 8000, 9000, 10000, 12000};
        double[] dists = {1.2, 2.5, 3.8, 4.5, 5.5, 6.2, 7.8, 9.0, 12.5, 18.0};
        double[] ratings = {4.5, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5};

        List<HousingFeatures> sample = new ArrayList<>();
        for (int i = 0; i < sqfts.length; i++) {
            sample.add(HousingFeatures.builder()
                    .squareFootage(sqfts[i])
                    .bedrooms(beds[i])
                    .bathrooms(baths[i])
                    .yearBuilt(years[i])
                    .lotSize(lots[i])
                    .distanceToCityCenter(dists[i])
                    .schoolRating(ratings[i])
                    .build());
        }
        return sample;
    }
}