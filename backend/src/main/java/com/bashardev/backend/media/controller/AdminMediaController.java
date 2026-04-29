package com.bashardev.backend.media.controller;

import com.bashardev.backend.media.dto.MediaAssetResponse;
import com.bashardev.backend.media.service.MediaAssetService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/media")
public class AdminMediaController {

    private final MediaAssetService mediaAssetService;

    public AdminMediaController(MediaAssetService mediaAssetService) {
        this.mediaAssetService = mediaAssetService;
    }

    @GetMapping
    public List<MediaAssetResponse> getMediaAssets() {
        return mediaAssetService.getMediaAssets();
    }

    @PostMapping(path = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public MediaAssetResponse uploadImage(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) {
        String publicBaseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        return mediaAssetService.uploadImage(file, publicBaseUrl);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMediaAsset(@PathVariable Long id) {
        mediaAssetService.deleteMediaAsset(id);
    }
}
