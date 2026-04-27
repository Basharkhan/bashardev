package com.bashardev.backend.site.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SiteSettingsRequest(
        @NotBlank(message = "Site title is required")
        @Size(max = 150, message = "Site title must be at most 150 characters")
        String siteTitle,
        @NotBlank(message = "Site description is required")
        @Size(max = 255, message = "Site description must be at most 255 characters")
        String siteDescription,
        @NotBlank(message = "Owner name is required")
        @Size(max = 120, message = "Owner name must be at most 120 characters")
        String ownerName,
        @NotBlank(message = "Headline is required")
        @Size(max = 160, message = "Headline must be at most 160 characters")
        String headline,
        @NotBlank(message = "Short bio is required")
        @Size(max = 500, message = "Short bio must be at most 500 characters")
        String shortBio,
        String fullBio,
        @Size(max = 120, message = "Location must be at most 120 characters")
        String location,
        @Size(max = 120, message = "Email must be at most 120 characters")
        String email,
        @Size(max = 255, message = "GitHub URL must be at most 255 characters")
        String githubUrl,
        @Size(max = 255, message = "LinkedIn URL must be at most 255 characters")
        String linkedinUrl,
        @Size(max = 255, message = "Twitter URL must be at most 255 characters")
        String twitterUrl,
        @Size(max = 255, message = "Resume URL must be at most 255 characters")
        String resumeUrl,
        @Size(max = 255, message = "Profile image URL must be at most 255 characters")
        String profileImageUrl,
        @Size(max = 255, message = "Hero image URL must be at most 255 characters")
        String heroImageUrl
) {
}
