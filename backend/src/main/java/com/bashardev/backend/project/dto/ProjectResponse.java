package com.bashardev.backend.project.dto;

import java.time.Instant;

public record ProjectResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String contentMarkdown,
        String coverImageUrl,
        String galleryImageUrls,
        String liveUrl,
        String repositoryUrl,
        String techStack,
        boolean featured,
        String status,
        Instant publishedAt,
        int displayOrder,
        String seoTitle,
        String seoDescription,
        Instant createdAt,
        Instant updatedAt
) {
}
