package com.bashardev.backend.project.dto;

import com.bashardev.backend.project.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record ProjectRequest(
        @NotBlank @Size(max = 150) String title,
        @NotBlank @Size(max = 180) String slug,
        @NotBlank @Size(max = 500) String summary,
        String contentMarkdown,
        @Size(max = 255) String coverImageUrl,
        String galleryImageUrls,
        @Size(max = 255) String liveUrl,
        @Size(max = 255) String repositoryUrl,
        String techStack,
        boolean featured,
        @NotNull ProjectStatus status,
        Instant publishedAt,
        int displayOrder,
        @Size(max = 160) String seoTitle,
        @Size(max = 255) String seoDescription
) {
}
