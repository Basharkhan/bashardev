package com.bashardev.backend.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProjectTechStackItemRequest(
        @NotBlank(message = "Tech stack item name is required")
        @Size(max = 100, message = "Tech stack item name must be at most 100 characters")
        String name
) {
}
