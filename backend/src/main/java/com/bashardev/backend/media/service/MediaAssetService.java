package com.bashardev.backend.media.service;

import com.bashardev.backend.blog.repository.BlogPostRepository;
import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.media.dto.MediaAssetResponse;
import com.bashardev.backend.media.entity.MediaAsset;
import com.bashardev.backend.media.repository.MediaAssetRepository;
import com.bashardev.backend.upload.service.ImageStorageService;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MediaAssetService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final Sort ADMIN_SORT = Sort.by(
            Sort.Order.desc("createdAt"),
            Sort.Order.desc("id")
    );

    private final MediaAssetRepository mediaAssetRepository;
    private final BlogPostRepository blogPostRepository;
    private final ImageStorageService imageStorageService;

    public MediaAssetService(
            MediaAssetRepository mediaAssetRepository,
            BlogPostRepository blogPostRepository,
            ImageStorageService imageStorageService
    ) {
        this.mediaAssetRepository = mediaAssetRepository;
        this.blogPostRepository = blogPostRepository;
        this.imageStorageService = imageStorageService;
    }

    public List<MediaAssetResponse> getMediaAssets() {
        return mediaAssetRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(MediaAssetService::toResponse)
                .toList();
    }

    public PagedResponse<MediaAssetResponse> getAdminMediaAssets(int page, int size, String search) {
        String normalizedSearch = normalizeSearch(search);

        return PagedResponse.from(mediaAssetRepository
                .findByOriginalFileNameContainingIgnoreCaseOrStoredFileNameContainingIgnoreCaseOrContentTypeContainingIgnoreCase(
                        normalizedSearch,
                        normalizedSearch,
                        normalizedSearch,
                        PageRequest.of(normalizePage(page), normalizePageSize(size), ADMIN_SORT)
                )
                .map(MediaAssetService::toResponse));
    }

    public MediaAssetResponse uploadImage(MultipartFile file, String publicBaseUrl) {
        ImageStorageService.StoredImage storedImage = imageStorageService.storeImage(file, publicBaseUrl);

        MediaAsset mediaAsset = new MediaAsset();
        mediaAsset.setOriginalFileName(storedImage.originalFileName());
        mediaAsset.setStoredFileName(storedImage.storedFileName());
        mediaAsset.setContentType(storedImage.contentType());
        mediaAsset.setSizeBytes(storedImage.sizeBytes());
        mediaAsset.setUrl(storedImage.url());

        return toResponse(mediaAssetRepository.save(mediaAsset));
    }

    public void deleteMediaAsset(Long id) {
        MediaAsset mediaAsset = mediaAssetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media asset not found"));

        if (blogPostRepository.countByMediaAssetsId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a media asset assigned to blog posts");
        }

        imageStorageService.deleteImage(mediaAsset.getStoredFileName());
        mediaAssetRepository.delete(mediaAsset);
    }

    public Set<MediaAsset> resolveMediaAssets(List<Long> mediaAssetIds) {
        if (mediaAssetIds == null || mediaAssetIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        Set<Long> distinctIds = new LinkedHashSet<>(mediaAssetIds);
        List<MediaAsset> mediaAssets = mediaAssetRepository.findAllById(distinctIds);

        if (mediaAssets.size() != distinctIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more media assets do not exist");
        }

        return new LinkedHashSet<>(mediaAssets);
    }

    private static int normalizePage(int page) {
        return Math.max(page, 0);
    }

    private static int normalizePageSize(int size) {
        if (size < 1) {
            return 1;
        }

        return Math.min(size, MAX_PAGE_SIZE);
    }

    private static String normalizeSearch(String search) {
        if (!StringUtils.hasText(search)) {
            return "";
        }

        return search.trim();
    }

    public static MediaAssetResponse toResponse(MediaAsset mediaAsset) {
        return new MediaAssetResponse(
                mediaAsset.getId(),
                mediaAsset.getOriginalFileName(),
                mediaAsset.getStoredFileName(),
                mediaAsset.getContentType(),
                mediaAsset.getSizeBytes(),
                mediaAsset.getUrl(),
                mediaAsset.getCreatedAt(),
                mediaAsset.getUpdatedAt()
        );
    }
}
