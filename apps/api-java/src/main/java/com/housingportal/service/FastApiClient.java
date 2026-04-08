package com.housingportal.service;

import com.housingportal.exception.FastApiException;
import com.housingportal.model.request.HousingFeatures;
import com.housingportal.model.response.FastApiDtos;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Typed client for the FastAPI ML service.
 * All endpoint paths are taken directly from the OpenAPI spec.
 */
@Service
@Slf4j
public class FastApiClient {

    private final WebClient client;

    public FastApiClient(@Qualifier("fastApiWebClient") WebClient client) {
        this.client = client;
    }

    // ── POST /api/v1/predict ─────────────────────────────────────────────────

    public FastApiDtos.SinglePredictResponse predictSingle(HousingFeatures features) {
        log.debug("Calling FastAPI POST /api/v1/predict");
        var request = new FastApiDtos.SinglePredictRequest(features);
        return client.post()
                .uri("/api/v1/predict")
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatus.UNPROCESSABLE_ENTITY::equals,
                        res -> res.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(
                                        new FastApiException("Validation error: " + body, 422))))
                .bodyToMono(FastApiDtos.SinglePredictResponse.class)
                .doOnError(WebClientResponseException.class, e ->
                        log.error("FastAPI error {} on /predict: {}", e.getStatusCode(), e.getMessage()))
                .onErrorMap(WebClientResponseException.class, e ->
                        new FastApiException("FastAPI predict failed: " + e.getMessage(), e.getStatusCode().value()))
                .block();
    }

    // ── POST /api/v1/predict/batch ───────────────────────────────────────────

    public FastApiDtos.BatchPredictResponse predictBatch(List<HousingFeatures> features) {
        log.debug("Calling FastAPI POST /api/v1/predict/batch ({} items)", features.size());
        var request = new FastApiDtos.BatchPredictRequest(features);
        return client.post()
                .uri("/api/v1/predict/batch")
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatus.UNPROCESSABLE_ENTITY::equals,
                        res -> res.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(
                                        new FastApiException("Batch validation error: " + body, 422))))
                .bodyToMono(FastApiDtos.BatchPredictResponse.class)
                .doOnError(WebClientResponseException.class, e ->
                        log.error("FastAPI error {} on /predict/batch: {}", e.getStatusCode(), e.getMessage()))
                .onErrorMap(WebClientResponseException.class, e ->
                        new FastApiException("FastAPI batch predict failed: " + e.getMessage(),
                                e.getStatusCode().value()))
                .block();
    }

    // ── GET /api/v1/model-info ───────────────────────────────────────────────

    public FastApiDtos.ModelInfoResponse getModelInfo() {
        log.debug("Calling FastAPI GET /api/v1/model-info");
        return client.get()
                .uri("/api/v1/model-info")
                .retrieve()
                .bodyToMono(FastApiDtos.ModelInfoResponse.class)
                .onErrorMap(WebClientResponseException.class, e ->
                        new FastApiException("FastAPI model-info failed: " + e.getMessage(),
                                e.getStatusCode().value()))
                .block();
    }

    // ── GET /api/v1/health ───────────────────────────────────────────────────

    public FastApiDtos.HealthResponse getHealth() {
        log.debug("Calling FastAPI GET /api/v1/health");
        return client.get()
                .uri("/api/v1/health")
                .retrieve()
                .bodyToMono(FastApiDtos.HealthResponse.class)
                .onErrorResume(e -> {
                    log.warn("FastAPI health check failed: {}", e.getMessage());
                    var degraded = new FastApiDtos.HealthResponse();
                    degraded.setStatus("unhealthy");
                    return Mono.just(degraded);
                })
                .block();
    }
}