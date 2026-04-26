package com.bashardev.backend.auth.service;

import com.bashardev.backend.auth.dto.CurrentUserResponse;
import com.bashardev.backend.auth.dto.LoginRequest;
import com.bashardev.backend.auth.dto.LoginResponse;
import com.bashardev.backend.security.AuthenticatedUser;
import com.bashardev.backend.security.JwtService;
import com.bashardev.backend.user.entity.User;
import com.bashardev.backend.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!user.isEnabled() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return new LoginResponse(jwtService.generateToken(user), jwtService.getExpirationSeconds());
    }

    public CurrentUserResponse me(AuthenticatedUser authenticatedUser) {
        User user = authenticatedUser.user();
        return new CurrentUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
        );
    }
}
