package com.bashardev.backend.media.service;

import com.bashardev.backend.media.dto.MediaAssetResponse;
import com.bashardev.backend.media.entity.MediaAsset;
import com.bashardev.backend.media.repository.MediaAssetRepository;
import com.bashardev.backend.upload.service.ImageStorageService;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MediaAssetService {

    private final MediaAssetRepository mediaAssetRepository;
    private final ImageStorageService imageStorageService;

    public MediaAssetService(MediaAssetRepository mediaAssetRepository, ImageStorageService imageStorageService) {
        this.mediaAssetRepository = mediaAssetRepository;
        this.imageStorageService = imageStorageService;
    }

    public List<MediaAssetResponse> getMediaAssets() {
        return mediaAssetRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(MediaAssetService::toResponse)
                .toList();
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

        if (!mediaAsset.getBlogPosts().isEmpty()) {
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
