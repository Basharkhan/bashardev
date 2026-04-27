package com.bashardev.backend.blog.repository;

import com.bashardev.backend.blog.entity.BlogPost;
import com.bashardev.backend.blog.entity.BlogPostStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    Optional<BlogPost> findBySlug(String slug);

    Page<BlogPost> findAllByStatus(BlogPostStatus status, Pageable pageable);
}
