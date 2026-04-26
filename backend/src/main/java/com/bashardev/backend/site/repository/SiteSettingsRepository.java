package com.bashardev.backend.site.repository;

import com.bashardev.backend.site.entity.SiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Long> {
}
