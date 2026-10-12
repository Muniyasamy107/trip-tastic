package com.triptastic.shared;

import java.time.Instant;
import java.util.Map;

public record ApiError(String message, Map<String, String> details, Instant timestamp) {
    public static ApiError of(String message, Map<String, String> details) {
        return new ApiError(message, details, Instant.now());
    }
}
