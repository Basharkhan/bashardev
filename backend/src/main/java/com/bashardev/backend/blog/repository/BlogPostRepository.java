package com.bashardev.backend.blog.repository;

import com.bashardev.backend.blog.entity.BlogPost;
import com.bashardev.backend.blog.entity.BlogPostStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    @Override
    @EntityGraph(attributePaths = {"tags", "mediaAssets"})
    Optional<BlogPost> findById(Long id);

    @EntityGraph(attributePaths = {"tags", "mediaAssets"})
    Optional<BlogPost> findBySlug(String slug);

    @EntityGraph(attributePaths = {"tags", "mediaAssets"})
    Page<BlogPost> findAllByStatus(BlogPostStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"tags", "mediaAssets"})
    Page<BlogPost> findAll(Pageable pageable);

    long countByTagsId(Long tagId);
}
