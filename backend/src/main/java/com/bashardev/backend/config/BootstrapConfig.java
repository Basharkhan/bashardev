package com.bashardev.backend.config;

import com.bashardev.backend.user.entity.User;
import com.bashardev.backend.user.entity.UserRole;
import com.bashardev.backend.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class BootstrapConfig {

    @Bean
    CommandLineRunner bootstrapAdminUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AppProperties properties
    ) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            AppProperties.Admin admin = properties.bootstrap().admin();

            User user = new User();
            user.setUsername(admin.username());
            user.setEmail(admin.email());
            user.setPasswordHash(passwordEncoder.encode(admin.password()));
            user.setFirstName(admin.firstName());
            user.setLastName(admin.lastName());
            user.setRole(UserRole.ADMIN);
            user.setEnabled(true);
            userRepository.save(user);
        };
    }
}
