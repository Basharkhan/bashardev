package com.bashardev.backend.project.dto;

public record ProjectGalleryItemResponse(
        Long id,
        int position,
        String imageUrl,
        String altText
) {
}
