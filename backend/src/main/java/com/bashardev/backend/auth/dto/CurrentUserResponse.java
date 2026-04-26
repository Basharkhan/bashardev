package com.bashardev.backend.auth.dto;

public record CurrentUserResponse(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        String role
) {
}
