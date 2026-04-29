package com.bashardev.backend.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Cors cors, Jwt jwt, Bootstrap bootstrap, Storage storage) {

    public record Cors(List<String> allowedOrigins) {
    }

    public record Jwt(String secret, long expirationMinutes) {
    }

    public record Bootstrap(Admin admin) {
    }

    public record Admin(
            String username,
            String email,
            String password,
            String firstName,
            String lastName
    ) {
    }

    public record Storage(
            String uploadDir,
            long maxImageSizeBytes
    ) {
    }
}
