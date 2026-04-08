package com.housingportal.controller;

import com.housingportal.model.response.FiltersResponse;
import com.housingportal.model.response.StatsResponse;
import com.housingportal.service.AnalysisService;
import com.housingportal.service.ExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@Slf4j
public class AnalysisController {

    private final AnalysisService analysisService;
    private final ExportService exportService;

    /**
     * GET /api/analysis/stats
     * Returns aggregated market statistics.
     * Response is cached via @Cacheable in service layer.
     */
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        log.info("GET /api/analysis/stats");
        return ResponseEntity.ok(analysisService.getMarketStats());
    }

    /**
     * GET /api/analysis/filters
     * Returns available filter options for the market dashboard.
     * Response is cached via @Cacheable in service layer.
     */
    @GetMapping("/filters")
    public ResponseEntity<FiltersResponse> getFilters() {
        log.info("GET /api/analysis/filters");
        return ResponseEntity.ok(analysisService.getMarketFilters());
    }

    /**
     * GET /api/analysis/export?format=csv
     * Exports market data with ML predictions as CSV.
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(defaultValue = "csv") String format) {
        log.info("GET /api/analysis/export?format={}", format);

        if (!"csv".equalsIgnoreCase(format)) {
            return ResponseEntity.badRequest().build();
        }

        byte[] data = exportService.exportCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"housing_market_export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(data.length)
                .body(data);
    }
}