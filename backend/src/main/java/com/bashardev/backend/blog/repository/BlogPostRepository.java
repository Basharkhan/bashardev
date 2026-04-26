package com.bashardev.backend.blog.repository;

import com.bashardev.backend.blog.entity.BlogPost;
import com.bashardev.backend.blog.entity.BlogPostStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    Optional<BlogPost> findBySlug(String slug);

    List<BlogPost> findAllByStatusOrderByPublishedAtDescCreatedAtDesc(BlogPostStatus status);
}
