package com.bashardev.backend.media.repository;

import com.bashardev.backend.media.entity.MediaAsset;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, Long> {

    List<MediaAsset> findAllByOrderByCreatedAtDesc();

    Page<MediaAsset> findByOriginalFileNameContainingIgnoreCaseOrStoredFileNameContainingIgnoreCaseOrContentTypeContainingIgnoreCase(
            String originalFileNameQuery,
            String storedFileNameQuery,
            String contentTypeQuery,
            Pageable pageable
    );

    long countByBlogPostsId(Long blogPostId);
}
