package com.bashardev.backend.project.dto;

import com.bashardev.backend.project.entity.ProjectStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public record ProjectRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must be at most 150 characters")
        String title,
        @NotBlank(message = "Slug is required")
        @Size(max = 180, message = "Slug must be at most 180 characters")
        String slug,
        @NotBlank(message = "Summary is required")
        @Size(max = 500, message = "Summary must be at most 500 characters")
        String summary,
        String contentMarkdown,
        @Size(max = 255, message = "Cover image URL must be at most 255 characters")
        String coverImageUrl,
        @Valid
        List<ProjectGalleryItemRequest> gallery,
        @Size(max = 255, message = "Live URL must be at most 255 characters")
        String liveUrl,
        @Size(max = 255, message = "Repository URL must be at most 255 characters")
        String repositoryUrl,
        @Valid
        List<ProjectTechStackItemRequest> techStack,
        boolean featured,
        @NotNull(message = "Status is required")
        ProjectStatus status,
        Instant publishedAt,
        @Min(value = 0, message = "Display order must be non-negative")
        int displayOrder,
        @Size(max = 160, message = "SEO title must be at most 160 characters")
        String seoTitle,
        @Size(max = 255, message = "SEO description must be at most 255 characters")
        String seoDescription
) {
}
