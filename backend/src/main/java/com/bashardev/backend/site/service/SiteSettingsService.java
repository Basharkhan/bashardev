package com.bashardev.backend.site.service;

import com.bashardev.backend.site.dto.SiteSettingsRequest;
import com.bashardev.backend.site.dto.SiteSettingsResponse;
import com.bashardev.backend.site.entity.SiteSettings;
import com.bashardev.backend.site.repository.SiteSettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class SiteSettingsService {

    private final SiteSettingsRepository siteSettingsRepository;

    public SiteSettingsService(SiteSettingsRepository siteSettingsRepository) {
        this.siteSettingsRepository = siteSettingsRepository;
    }

    public SiteSettingsResponse getSiteSettings() {
        return toResponse(siteSettingsRepository.findAll().stream().findFirst().orElse(null));
    }

    public SiteSettingsResponse upsertSiteSettings(SiteSettingsRequest request) {
        SiteSettings settings = siteSettingsRepository.findAll().stream().findFirst().orElseGet(SiteSettings::new);
        apply(settings, request);
        return toResponse(siteSettingsRepository.save(settings));
    }

    private static void apply(SiteSettings settings, SiteSettingsRequest request) {
        settings.setSiteTitle(request.siteTitle());
        settings.setSiteDescription(request.siteDescription());
        settings.setOwnerName(request.ownerName());
        settings.setHeadline(request.headline());
        settings.setShortBio(request.shortBio());
        settings.setFullBio(request.fullBio());
        settings.setLocation(request.location());
        settings.setEmail(request.email());
        settings.setGithubUrl(request.githubUrl());
        settings.setLinkedinUrl(request.linkedinUrl());
        settings.setTwitterUrl(request.twitterUrl());
        settings.setResumeUrl(request.resumeUrl());
        settings.setProfileImageUrl(request.profileImageUrl());
        settings.setHeroImageUrl(request.heroImageUrl());
    }

    private static SiteSettingsResponse toResponse(SiteSettings settings) {
        if (settings == null) {
            return null;
        }

        return new SiteSettingsResponse(
                settings.getId(),
                settings.getSiteTitle(),
                settings.getSiteDescription(),
                settings.getOwnerName(),
                settings.getHeadline(),
                settings.getShortBio(),
                settings.getFullBio(),
                settings.getLocation(),
                settings.getEmail(),
                settings.getGithubUrl(),
                settings.getLinkedinUrl(),
                settings.getTwitterUrl(),
                settings.getResumeUrl(),
                settings.getProfileImageUrl(),
                settings.getHeroImageUrl()
        );
    }
}
