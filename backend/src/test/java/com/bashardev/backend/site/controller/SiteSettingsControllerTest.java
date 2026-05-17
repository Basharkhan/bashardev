package com.bashardev.backend.site.controller;

import com.bashardev.backend.common.web.GlobalExceptionHandler;
import com.bashardev.backend.site.dto.SiteSettingsRequest;
import com.bashardev.backend.site.dto.SiteSettingsResponse;
import com.bashardev.backend.site.service.SiteSettingsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SiteSettingsControllerTest {

    @Mock
    private SiteSettingsService siteSettingsService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(new SiteSettingsController(siteSettingsService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void getSiteSettingsReturnsSettingsWhenRowExists() throws Exception {
        SiteSettingsResponse response = new SiteSettingsResponse(
                1L, "BasharDev", "A portfolio", "Bashar Khan", "Developer", "Short bio",
                "Full bio", "Dhaka", "email@test.com", "https://github.com/bashar",
                null, null, null, null, null
        );

        when(siteSettingsService.getSiteSettings()).thenReturn(response);

        mockMvc.perform(get("/api/site-settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.siteTitle").value("BasharDev"))
                .andExpect(jsonPath("$.email").value("email@test.com"))
                .andExpect(jsonPath("$.githubUrl").value("https://github.com/bashar"));
    }

    @Test
    void getSiteSettingsReturnsDefaultsWhenNoRowExists() throws Exception {
        SiteSettingsResponse defaults = new SiteSettingsResponse(
                null, "BasharDev", "Personal portfolio and blog", "Bashar Khan",
                "Software Developer", "Full-stack developer building modern web applications.",
                null, null, null, null, null, null, null, null, null
        );

        when(siteSettingsService.getSiteSettings()).thenReturn(defaults);

        mockMvc.perform(get("/api/site-settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isEmpty())
                .andExpect(jsonPath("$.siteTitle").value("BasharDev"));
    }

    @Test
    void upsertSiteSettingsReturnsUpdatedSettings() throws Exception {
        SiteSettingsRequest request = new SiteSettingsRequest(
                "Updated", "Updated desc", "Owner", "Headline", "Bio",
                null, null, null, null, null, null, null, null, null
        );

        SiteSettingsResponse response = new SiteSettingsResponse(
                1L, "Updated", "Updated desc", "Owner", "Headline", "Bio",
                null, null, null, null, null, null, null, null, null
        );

        when(siteSettingsService.upsertSiteSettings(request)).thenReturn(response);

        mockMvc.perform(put("/api/site-settings")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.siteTitle").value("Updated"));
    }

    @Test
    void upsertSiteSettingsRejectsBlankRequiredFields() throws Exception {
        SiteSettingsRequest request = new SiteSettingsRequest(
                "", "", "", "", "",
                null, null, null, null, null, null, null, null, null
        );

        mockMvc.perform(put("/api/site-settings")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.siteTitle").value("Site title is required"))
                .andExpect(jsonPath("$.fieldErrors.siteDescription").value("Site description is required"))
                .andExpect(jsonPath("$.fieldErrors.ownerName").value("Owner name is required"))
                .andExpect(jsonPath("$.fieldErrors.headline").value("Headline is required"))
                .andExpect(jsonPath("$.fieldErrors.shortBio").value("Short bio is required"));
    }

    @Test
    void upsertSiteSettingsRejectsInvalidEmail() throws Exception {
        SiteSettingsRequest request = new SiteSettingsRequest(
                "Title", "Desc", "Owner", "Headline", "Bio",
                null, null, "not-an-email", null, null, null, null, null, null
        );

        mockMvc.perform(put("/api/site-settings")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.email").value("must be a well-formed email address"));
    }

    @Test
    void upsertSiteSettingsRejectsInvalidUrls() throws Exception {
        SiteSettingsRequest request = new SiteSettingsRequest(
                "Title", "Desc", "Owner", "Headline", "Bio",
                null, null, null, "not-a-url", "ftp://invalid", "not-a-url",
                null, null, null
        );

        mockMvc.perform(put("/api/site-settings")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.githubUrl").value("must be a valid URL"))
                .andExpect(jsonPath("$.fieldErrors.linkedinUrl").value("must be a valid URL"))
                .andExpect(jsonPath("$.fieldErrors.twitterUrl").value("must be a valid URL"));
    }

    @Test
    void upsertSiteSettingsAcceptsEmptyOptionalFields() throws Exception {
        SiteSettingsRequest request = new SiteSettingsRequest(
                "Title", "Desc", "Owner", "Headline", "Bio",
                null, "", "", "", "", "", "", "", ""
        );

        SiteSettingsResponse response = new SiteSettingsResponse(
                1L, "Title", "Desc", "Owner", "Headline", "Bio",
                null, null, null, null, null, null, null, null, null
        );

        when(siteSettingsService.upsertSiteSettings(request)).thenReturn(response);

        mockMvc.perform(put("/api/site-settings")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void upsertSiteSettingsAcceptsValidEmailAndUrls() throws Exception {
        SiteSettingsRequest request = new SiteSettingsRequest(
                "Title", "Desc", "Owner", "Headline", "Bio",
                null, null, "test@example.com", "https://github.com/test",
                "https://linkedin.com/in/test", "https://twitter.com/test",
                "https://example.com/resume.pdf", "https://example.com/profile.jpg",
                "https://example.com/hero.jpg"
        );

        SiteSettingsResponse response = new SiteSettingsResponse(
                1L, "Title", "Desc", "Owner", "Headline", "Bio",
                null, null, "test@example.com", "https://github.com/test",
                "https://linkedin.com/in/test", "https://twitter.com/test",
                "https://example.com/resume.pdf", "https://example.com/profile.jpg",
                "https://example.com/hero.jpg"
        );

        when(siteSettingsService.upsertSiteSettings(request)).thenReturn(response);

        mockMvc.perform(put("/api/site-settings")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.githubUrl").value("https://github.com/test"));
    }
}
