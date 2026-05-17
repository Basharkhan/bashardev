package com.bashardev.backend.site.mapper;

import com.bashardev.backend.site.dto.SiteSettingsRequest;
import com.bashardev.backend.site.dto.SiteSettingsResponse;
import com.bashardev.backend.site.entity.SiteSettings;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SiteSettingsMapper {

    SiteSettingsResponse toResponse(SiteSettings entity);

    void updateEntity(@MappingTarget SiteSettings entity, SiteSettingsRequest request);
}
