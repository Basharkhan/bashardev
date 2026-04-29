package com.bashardev.backend.blog.dto;

import com.bashardev.backend.media.dto.MediaAssetResponse;
import com.bashardev.backend.tag.dto.TagResponse;
import java.time.Instant;
import java.util.List;

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
        List<TagResponse> tags,
        List<MediaAssetResponse> mediaAssets,
        Instant createdAt,
        Instant updatedAt
) {
}
