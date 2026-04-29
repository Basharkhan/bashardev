package com.bashardev.backend.media.dto;

import java.time.Instant;

public record MediaAssetResponse(
        Long id,
        String originalFileName,
        String storedFileName,
        String contentType,
        long sizeBytes,
        String url,
        Instant createdAt,
        Instant updatedAt
) {
}
