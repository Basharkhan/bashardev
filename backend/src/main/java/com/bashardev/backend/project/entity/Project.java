package com.bashardev.backend.project.entity;

import com.bashardev.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "projects")
public class Project extends BaseEntity {

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "slug", nullable = false, unique = true, length = 180)
    private String slug;

    @Column(name = "summary", nullable = false, length = 500)
    private String summary;

    @Column(name = "content_markdown", columnDefinition = "TEXT")
    private String contentMarkdown;

    @Column(name = "cover_image_url", length = 255)
    private String coverImageUrl;

    @Column(name = "gallery_image_urls", columnDefinition = "TEXT")
    private String galleryImageUrls;

    @Column(name = "live_url", length = 255)
    private String liveUrl;

    @Column(name = "repository_url", length = 255)
    private String repositoryUrl;

    @Column(name = "tech_stack", columnDefinition = "TEXT")
    private String techStack;

    @Column(name = "featured", nullable = false)
    private boolean featured = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProjectStatus status = ProjectStatus.DRAFT;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Column(name = "seo_title", length = 160)
    private String seoTitle;

    @Column(name = "seo_description", length = 255)
    private String seoDescription;
}
