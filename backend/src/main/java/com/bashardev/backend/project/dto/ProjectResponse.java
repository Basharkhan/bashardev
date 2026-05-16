package com.bashardev.backend.project.dto;

import java.time.Instant;
import java.util.List;

public record ProjectResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String contentMarkdown,
        String coverImageUrl,
        List<ProjectGalleryItemResponse> gallery,
        String liveUrl,
        String repositoryUrl,
        List<ProjectTechStackItemResponse> techStack,
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
