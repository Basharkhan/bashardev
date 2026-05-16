package com.bashardev.backend.project.dto;

import java.time.Instant;

public record ProjectSummaryResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String coverImageUrl,
        String status,
        boolean featured,
        Instant publishedAt,
        int displayOrder,
        Instant updatedAt
) {
}
