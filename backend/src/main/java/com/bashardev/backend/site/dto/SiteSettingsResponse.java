package com.bashardev.backend.site.dto;

public record SiteSettingsResponse(
        Long id,
        String siteTitle,
        String siteDescription,
        String ownerName,
        String headline,
        String shortBio,
        String fullBio,
        String location,
        String email,
        String githubUrl,
        String linkedinUrl,
        String twitterUrl,
        String resumeUrl,
        String profileImageUrl,
        String heroImageUrl
) {
}
