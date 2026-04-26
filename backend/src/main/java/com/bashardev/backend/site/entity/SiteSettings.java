package com.bashardev.backend.site.entity;

import com.bashardev.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "site_settings")
public class SiteSettings extends BaseEntity {

    @Column(name = "site_title", nullable = false, length = 150)
    private String siteTitle;

    @Column(name = "site_description", nullable = false, length = 255)
    private String siteDescription;

    @Column(name = "owner_name", nullable = false, length = 120)
    private String ownerName;

    @Column(name = "headline", nullable = false, length = 160)
    private String headline;

    @Column(name = "short_bio", nullable = false, length = 500)
    private String shortBio;

    @Column(name = "full_bio", columnDefinition = "TEXT")
    private String fullBio;

    @Column(name = "location", length = 120)
    private String location;

    @Column(name = "email", length = 120)
    private String email;

    @Column(name = "github_url", length = 255)
    private String githubUrl;

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Column(name = "twitter_url", length = 255)
    private String twitterUrl;

    @Column(name = "resume_url", length = 255)
    private String resumeUrl;

    @Column(name = "profile_image_url", length = 255)
    private String profileImageUrl;

    @Column(name = "hero_image_url", length = 255)
    private String heroImageUrl;
}
