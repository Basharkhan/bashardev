package com.bashardev.backend.auth.dto;

public record LoginResponse(
        String accessToken,
        long expiresInSeconds
) {
}
