package com.bashardev.backend.blog.dto;

import java.time.Instant;

public record BlogPostResponse(
        Long id,
        String title,
        String slug,
        String excerpt,
        String contentMarkdown,
        String coverImageUrl,
        String status,
        boolean featured,
        Instant publishedAt,
        int readingTime,
        String seoTitle,
        String seoDescription,
        Instant createdAt,
        Instant updatedAt
) {
}
