package com.housingportal.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ── Validation errors (bean validation) ─────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null
                                ? fe.getDefaultMessage() : "Invalid value",
                        (a, b) -> a));

        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.UNPROCESSABLE_ENTITY);
        pd.setTitle("Validation Failed");
        pd.setType(URI.create("about:validation-error"));
        pd.setProperty("field_errors", fieldErrors);
        pd.setProperty("timestamp", Instant.now().toString());

        log.warn("Validation failed: {}", fieldErrors);
        return ResponseEntity.unprocessableEntity().body(pd);
    }

    // ── FastAPI upstream errors ──────────────────────────────────────────────
    @ExceptionHandler(FastApiException.class)
    public ResponseEntity<ProblemDetail> handleFastApi(FastApiException ex) {
        HttpStatus status = ex.getStatus() == 422
                ? HttpStatus.UNPROCESSABLE_ENTITY
                : HttpStatus.BAD_GATEWAY;

        ProblemDetail pd = ProblemDetail.forStatus(status);
        pd.setTitle("ML Service Error");
        pd.setDetail(ex.getMessage());
        pd.setType(URI.create("about:fastapi-error"));
        pd.setProperty("upstream_status", ex.getStatus());
        pd.setProperty("timestamp", Instant.now().toString());

        log.error("FastAPI upstream error ({}): {}", ex.getStatus(), ex.getMessage());
        return ResponseEntity.status(status).body(pd);
    }

    // ── Generic fallback ─────────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGeneric(Exception ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        pd.setTitle("Internal Server Error");
        pd.setDetail("An unexpected error occurred. Please try again.");
        pd.setProperty("timestamp", Instant.now().toString());

        log.error("Unhandled exception", ex);
        return ResponseEntity.internalServerError().body(pd);
    }
}