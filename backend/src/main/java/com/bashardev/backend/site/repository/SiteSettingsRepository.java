package com.bashardev.backend.site.repository;

import com.bashardev.backend.site.entity.SiteSettings;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Long> {

    @Query("SELECT s FROM SiteSettings s ORDER BY s.id ASC LIMIT 1")
    Optional<SiteSettings> findSingleton();
}
