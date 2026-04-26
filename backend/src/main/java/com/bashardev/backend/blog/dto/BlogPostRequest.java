package com.bashardev.backend.blog.dto;

import com.bashardev.backend.blog.entity.BlogPostStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record BlogPostRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 200) String slug,
        @NotBlank @Size(max = 500) String excerpt,
        @NotBlank String contentMarkdown,
        @Size(max = 255) String coverImageUrl,
        @NotNull BlogPostStatus status,
        boolean featured,
        Instant publishedAt,
        @Min(1) int readingTime,
        @Size(max = 160) String seoTitle,
        @Size(max = 255) String seoDescription
) {
}
