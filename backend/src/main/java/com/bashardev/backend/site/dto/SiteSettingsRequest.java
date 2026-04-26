package com.bashardev.backend.site.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SiteSettingsRequest(
        @NotBlank @Size(max = 150) String siteTitle,
        @NotBlank @Size(max = 255) String siteDescription,
        @NotBlank @Size(max = 120) String ownerName,
        @NotBlank @Size(max = 160) String headline,
        @NotBlank @Size(max = 500) String shortBio,
        String fullBio,
        @Size(max = 120) String location,
        @Size(max = 120) String email,
        @Size(max = 255) String githubUrl,
        @Size(max = 255) String linkedinUrl,
        @Size(max = 255) String twitterUrl,
        @Size(max = 255) String resumeUrl,
        @Size(max = 255) String profileImageUrl,
        @Size(max = 255) String heroImageUrl
) {
}
