package com.bashardev.backend.media.entity;

import com.bashardev.backend.blog.entity.BlogPost;
import com.bashardev.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "media_assets")
public class MediaAsset extends BaseEntity {

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "stored_file_name", nullable = false, unique = true, length = 255)
    private String storedFileName;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "url", nullable = false, unique = true, length = 255)
    private String url;

    @ManyToMany(mappedBy = "mediaAssets")
    private Set<BlogPost> blogPosts = new LinkedHashSet<>();
}
