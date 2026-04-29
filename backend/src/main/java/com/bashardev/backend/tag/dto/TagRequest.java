package com.bashardev.backend.tag.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TagRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 80, message = "Name must be at most 80 characters")
        String name,
        @NotBlank(message = "Slug is required")
        @Size(max = 100, message = "Slug must be at most 100 characters")
        String slug
) {
}
