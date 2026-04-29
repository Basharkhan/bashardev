package com.bashardev.backend.tag.entity;

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
@Table(name = "tags")
public class Tag extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 80)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @ManyToMany(mappedBy = "tags")
    private Set<BlogPost> blogPosts = new LinkedHashSet<>();
}
