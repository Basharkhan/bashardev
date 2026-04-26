package com.bashardev.backend.blog.entity;

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
@Table(name = "blog_posts")
public class BlogPost extends BaseEntity {

    @Column(name = "title", nullable = false, length = 180)
    private String title;

    @Column(name = "slug", nullable = false, unique = true, length = 200)
    private String slug;

    @Column(name = "excerpt", nullable = false, length = 500)
    private String excerpt;

    @Column(name = "content_markdown", nullable = false, columnDefinition = "TEXT")
    private String contentMarkdown;

    @Column(name = "cover_image_url", length = 255)
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BlogPostStatus status = BlogPostStatus.DRAFT;

    @Column(name = "featured", nullable = false)
    private boolean featured = false;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "reading_time", nullable = false)
    private int readingTime = 1;

    @Column(name = "seo_title", length = 160)
    private String seoTitle;

    @Column(name = "seo_description", length = 255)
    private String seoDescription;
}
