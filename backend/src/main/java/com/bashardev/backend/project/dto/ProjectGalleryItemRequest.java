package com.bashardev.backend.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectGalleryItemRequest(
        @NotBlank(message = "Gallery image URL is required")
        @Size(max = 255, message = "Gallery image URL must be at most 255 characters")
        String imageUrl,
        @Size(max = 160, message = "Gallery alt text must be at most 160 characters")
        String altText
) {
}
