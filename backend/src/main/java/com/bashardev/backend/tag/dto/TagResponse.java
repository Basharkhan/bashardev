package com.bashardev.backend.tag.dto;

import java.time.Instant;

public record TagResponse(
        Long id,
        String name,
        String slug,
        Instant createdAt,
        Instant updatedAt
) {
}
