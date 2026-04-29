package com.bashardev.backend.blog.entity;

import com.bashardev.backend.common.entity.BaseEntity;
import com.bashardev.backend.media.entity.MediaAsset;
import com.bashardev.backend.tag.entity.Tag;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
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

    @ManyToMany
    @JoinTable(
            name = "blog_post_tags",
            joinColumns = @JoinColumn(name = "blog_post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "blog_post_media_assets",
            joinColumns = @JoinColumn(name = "blog_post_id"),
            inverseJoinColumns = @JoinColumn(name = "media_asset_id")
    )
    private Set<MediaAsset> mediaAssets = new LinkedHashSet<>();
}
