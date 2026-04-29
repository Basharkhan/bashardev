package com.bashardev.backend.media.repository;

import com.bashardev.backend.media.entity.MediaAsset;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, Long> {

    List<MediaAsset> findAllByOrderByCreatedAtDesc();

    long countByBlogPostsId(Long blogPostId);
}
