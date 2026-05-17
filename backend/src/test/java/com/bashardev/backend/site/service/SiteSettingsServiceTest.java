package com.bashardev.backend.site.service;

import com.bashardev.backend.site.dto.SiteSettingsRequest;
import com.bashardev.backend.site.dto.SiteSettingsResponse;
import com.bashardev.backend.site.entity.SiteSettings;
import com.bashardev.backend.site.mapper.SiteSettingsMapper;
import com.bashardev.backend.site.repository.SiteSettingsRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteSettingsServiceTest {

    @Mock
    private SiteSettingsRepository siteSettingsRepository;

    @Mock
    private SiteSettingsMapper mapper;

    @InjectMocks
    private SiteSettingsService siteSettingsService;

    @Test
    void getSiteSettingsReturnsResponseWhenRowExists() {
        SiteSettings entity = new SiteSettings();
        entity.setId(1L);
        entity.setSiteTitle("My Site");
        SiteSettingsResponse expected = new SiteSettingsResponse(
                1L, "My Site", "Desc", "Owner", "Headline", "Short bio",
                null, null, null, null, null, null, null, null, null
        );

        when(siteSettingsRepository.findSingleton()).thenReturn(Optional.of(entity));
        when(mapper.toResponse(entity)).thenReturn(expected);

        SiteSettingsResponse response = siteSettingsService.getSiteSettings();

        assertThat(response).isNotNull();
        assertThat(response.siteTitle()).isEqualTo("My Site");
        verify(mapper).toResponse(entity);
    }

    @Test
    void getSiteSettingsReturnsDefaultResponseWhenNoRowExists() {
        when(siteSettingsRepository.findSingleton()).thenReturn(Optional.empty());

        SiteSettingsResponse response = siteSettingsService.getSiteSettings();

        assertThat(response).isNotNull();
        assertThat(response.siteTitle()).isEqualTo("BasharDev");
        assertThat(response.siteDescription()).isEqualTo("Personal portfolio and blog");
        assertThat(response.ownerName()).isEqualTo("Bashar Khan");
        assertThat(response.id()).isNull();
    }

    @Test
    void upsertSiteSettingsCreatesRowWhenNoneExists() {
        SiteSettingsRequest request = new SiteSettingsRequest(
                "New Site", "New Desc", "New Owner", "New Headline", "New Bio",
                null, null, null, null, null, null, null, null, null
        );

        SiteSettings savedEntity = new SiteSettings();
        savedEntity.setId(1L);
        savedEntity.setSiteTitle("New Site");

        SiteSettingsResponse expected = new SiteSettingsResponse(
                1L, "New Site", "New Desc", "New Owner", "New Headline", "New Bio",
                null, null, null, null, null, null, null, null, null
        );

        when(siteSettingsRepository.findSingleton()).thenReturn(Optional.empty());
        when(siteSettingsRepository.save(any(SiteSettings.class))).thenReturn(savedEntity);
        when(mapper.toResponse(savedEntity)).thenReturn(expected);

        SiteSettingsResponse response = siteSettingsService.upsertSiteSettings(request);

        assertThat(response).isNotNull();
        assertThat(response.siteTitle()).isEqualTo("New Site");
        verify(mapper).updateEntity(any(SiteSettings.class), any(SiteSettingsRequest.class));
        verify(siteSettingsRepository).save(any(SiteSettings.class));
    }

    @Test
    void upsertSiteSettingsUpdatesExistingRow() {
        SiteSettingsRequest request = new SiteSettingsRequest(
                "Updated Site", "Updated Desc", "Updated Owner", "Updated Headline", "Updated Bio",
                "Full bio", "Location", "email@test.com", "https://github.com/test",
                null, null, null, null, null
        );

        SiteSettings existingEntity = new SiteSettings();
        existingEntity.setId(1L);
        existingEntity.setSiteTitle("Old Site");

        SiteSettings savedEntity = new SiteSettings();
        savedEntity.setId(1L);
        savedEntity.setSiteTitle("Updated Site");

        SiteSettingsResponse expected = new SiteSettingsResponse(
                1L, "Updated Site", "Updated Desc", "Updated Owner", "Updated Headline", "Updated Bio",
                "Full bio", "Location", "email@test.com", "https://github.com/test",
                null, null, null, null, null
        );

        when(siteSettingsRepository.findSingleton()).thenReturn(Optional.of(existingEntity));
        when(siteSettingsRepository.save(existingEntity)).thenReturn(savedEntity);
        when(mapper.toResponse(savedEntity)).thenReturn(expected);

        SiteSettingsResponse response = siteSettingsService.upsertSiteSettings(request);

        assertThat(response).isNotNull();
        assertThat(response.siteTitle()).isEqualTo("Updated Site");
        assertThat(response.email()).isEqualTo("email@test.com");
        assertThat(response.githubUrl()).isEqualTo("https://github.com/test");
        verify(mapper).updateEntity(existingEntity, request);
    }

    @Test
    void upsertSiteSettingsPreservesOptionalNulls() {
        SiteSettingsRequest request = new SiteSettingsRequest(
                "Site", "Desc", "Owner", "Headline", "Bio",
                null, null, null, null, null, null, null, null, null
        );

        SiteSettings existingEntity = new SiteSettings();
        existingEntity.setId(1L);

        SiteSettings savedEntity = new SiteSettings();
        savedEntity.setId(1L);

        SiteSettingsResponse expected = new SiteSettingsResponse(
                1L, "Site", "Desc", "Owner", "Headline", "Bio",
                null, null, null, null, null, null, null, null, null
        );

        when(siteSettingsRepository.findSingleton()).thenReturn(Optional.of(existingEntity));
        when(siteSettingsRepository.save(existingEntity)).thenReturn(savedEntity);
        when(mapper.toResponse(savedEntity)).thenReturn(expected);

        SiteSettingsResponse response = siteSettingsService.upsertSiteSettings(request);

        assertThat(response).isNotNull();
        assertThat(response.fullBio()).isNull();
        assertThat(response.githubUrl()).isNull();
        assertThat(response.email()).isNull();
    }
}
