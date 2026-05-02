package com.bashardev.backend.tag.repository;

import com.bashardev.backend.tag.entity.Tag;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findBySlug(String slug);

    Optional<Tag> findByName(String name);

    List<Tag> findAllByOrderByNameAsc();

    Page<Tag> findByNameContainingIgnoreCaseOrSlugContainingIgnoreCase(String nameQuery, String slugQuery, Pageable pageable);
}
