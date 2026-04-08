package com.housingportal.controller;

import com.housingportal.model.request.WhatIfRequest;
import com.housingportal.model.response.WhatIfResponse;
import com.housingportal.service.AnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@Slf4j
public class WhatIfController {

    private final AnalysisService analysisService;

    /**
     * POST /api/analysis/what-if
     *
     * Accepts a base property and N scenario overrides.
     * Internally calls FastAPI POST /api/v1/predict/batch with
     * (1 + N) features in a single request, then computes deltas.
     *
     * Request body example:
     * {
     *   "base_features": { "square_footage": 1850, "bedrooms": 3, ... },
     *   "scenarios": [
     *     { "label": "+1 Bedroom",   "overrides": { "bedrooms": 4 } },
     *     { "label": "+500 sq ft",   "overrides": { "square_footage": 2350 } },
     *     { "label": "Top school",   "overrides": { "school_rating": 9.5 } }
     *   ]
     * }
     */
    @PostMapping("/what-if")
    public ResponseEntity<WhatIfResponse> runWhatIf(
            @Valid @RequestBody WhatIfRequest request) {
        log.info("POST /api/analysis/what-if — {} scenario(s)",
                request.getScenarios().size());
        return ResponseEntity.ok(analysisService.runWhatIf(request));
    }
}