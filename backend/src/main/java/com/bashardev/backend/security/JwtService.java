package com.bashardev.backend.security;

import com.bashardev.backend.config.AppProperties;
import com.bashardev.backend.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMinutes;

    public JwtService(AppProperties properties) {
        String configuredSecret = properties.jwt().secret();
        byte[] keyBytes;

        try {
            keyBytes = Decoders.BASE64.decode(configuredSecret);
        } catch (RuntimeException ex) {
            keyBytes = configuredSecret.getBytes(StandardCharsets.UTF_8);
        }

        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMinutes = properties.jwt().expirationMinutes();
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(expirationMinutes * 60);

        return Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, User user) {
        Claims claims = parseClaims(token);
        return claims.getSubject().equals(user.getUsername()) && claims.getExpiration().after(new Date());
    }

    public long getExpirationSeconds() {
        return expirationMinutes * 60;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
