package com.bashardev.backend.site.service;

import com.bashardev.backend.site.dto.SiteSettingsRequest;
import com.bashardev.backend.site.dto.SiteSettingsResponse;
import com.bashardev.backend.site.entity.SiteSettings;
import com.bashardev.backend.site.mapper.SiteSettingsMapper;
import com.bashardev.backend.site.repository.SiteSettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class SiteSettingsService {

    private static final String DEFAULT_SITE_TITLE = "BasharDev";
    private static final String DEFAULT_SITE_DESCRIPTION = "Personal portfolio and blog";
    private static final String DEFAULT_OWNER_NAME = "Bashar Khan";
    private static final String DEFAULT_HEADLINE = "Software Developer";
    private static final String DEFAULT_SHORT_BIO = "Full-stack developer building modern web applications.";

    private final SiteSettingsRepository siteSettingsRepository;
    private final SiteSettingsMapper mapper;

    public SiteSettingsService(SiteSettingsRepository siteSettingsRepository, SiteSettingsMapper mapper) {
        this.siteSettingsRepository = siteSettingsRepository;
        this.mapper = mapper;
    }

    public SiteSettingsResponse getSiteSettings() {
        return siteSettingsRepository.findSingleton()
                .map(mapper::toResponse)
                .orElseGet(this::defaultResponse);
    }

    public SiteSettingsResponse upsertSiteSettings(SiteSettingsRequest request) {
        SiteSettings settings = siteSettingsRepository.findSingleton()
                .orElseGet(SiteSettings::new);
        mapper.updateEntity(settings, request);
        return mapper.toResponse(siteSettingsRepository.save(settings));
    }

    private SiteSettingsResponse defaultResponse() {
        return new SiteSettingsResponse(
                null,
                DEFAULT_SITE_TITLE,
                DEFAULT_SITE_DESCRIPTION,
                DEFAULT_OWNER_NAME,
                DEFAULT_HEADLINE,
                DEFAULT_SHORT_BIO,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }
}
