package com.bashardev.backend.contact.dto;

import com.bashardev.backend.contact.entity.ContactStatus;
import jakarta.validation.constraints.NotNull;

public record ContactStatusUpdateRequest(
        @NotNull(message = "Status is required")
        ContactStatus status
) {}
