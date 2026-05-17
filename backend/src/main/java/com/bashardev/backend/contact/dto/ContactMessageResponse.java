package com.bashardev.backend.contact.dto;

import com.bashardev.backend.contact.entity.ContactStatus;
import java.time.Instant;

public record ContactMessageResponse(
        Long id,
        String name,
        String email,
        String subject,
        String message,
        ContactStatus status,
        Instant createdAt,
        Instant updatedAt
) {}
