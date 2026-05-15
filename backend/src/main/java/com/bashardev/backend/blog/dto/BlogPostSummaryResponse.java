package com.bashardev.backend.blog.dto;

import java.time.Instant;

public record BlogPostSummaryResponse(
        Long id,
        String title,
        String slug,
        String status,
        boolean featured,
        Instant publishedAt
) {
}
