package com.bashardev.backend.blog.dto;

import com.bashardev.backend.blog.entity.BlogPostStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record BlogPostRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 180, message = "Title must be at most 180 characters")
        String title,
        @NotBlank(message = "Slug is required")
        @Size(max = 200, message = "Slug must be at most 200 characters")
        String slug,
        @NotBlank(message = "Excerpt is required")
        @Size(max = 500, message = "Excerpt must be at most 500 characters")
        String excerpt,
        @NotBlank(message = "Content is required")
        String contentMarkdown,
        @Size(max = 255, message = "Cover image URL must be at most 255 characters")
        String coverImageUrl,
        @NotNull(message = "Status is required")
        BlogPostStatus status,
        boolean featured,
        Instant publishedAt,
        @Min(value = 1, message = "Reading time must be at least 1 minute")
        int readingTime,
        @Size(max = 160, message = "SEO title must be at most 160 characters")
        String seoTitle,
        @Size(max = 255, message = "SEO description must be at most 255 characters")
        String seoDescription
) {
}
