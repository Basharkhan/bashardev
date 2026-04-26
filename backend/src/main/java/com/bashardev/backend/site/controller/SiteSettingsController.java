package com.bashardev.backend.site.controller;

import com.bashardev.backend.site.dto.SiteSettingsRequest;
import com.bashardev.backend.site.dto.SiteSettingsResponse;
import com.bashardev.backend.site.service.SiteSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/site-settings")
public class SiteSettingsController {

    private final SiteSettingsService siteSettingsService;

    public SiteSettingsController(SiteSettingsService siteSettingsService) {
        this.siteSettingsService = siteSettingsService;
    }

    @GetMapping
    public SiteSettingsResponse getSiteSettings() {
        return siteSettingsService.getSiteSettings();
    }

    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    public SiteSettingsResponse upsertSiteSettings(@Valid @RequestBody SiteSettingsRequest request) {
        return siteSettingsService.upsertSiteSettings(request);
    }
}
