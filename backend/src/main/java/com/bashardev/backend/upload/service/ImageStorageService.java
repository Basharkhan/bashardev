package com.bashardev.backend.upload.service;

import com.bashardev.backend.config.AppProperties;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ImageStorageService {

    private static final Map<String, String> CONTENT_TYPE_TO_EXTENSION = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    private final AppProperties properties;
    private Path imageUploadDir;

    public ImageStorageService(AppProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        try {
            Path rootUploadDir = Paths.get(properties.storage().uploadDir()).toAbsolutePath().normalize();
            imageUploadDir = rootUploadDir.resolve("images");
            Files.createDirectories(imageUploadDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to initialize upload storage", ex);
        }
    }

    public StoredImage storeImage(MultipartFile file, String publicBaseUrl) {
        validate(file);

        String extension = CONTENT_TYPE_TO_EXTENSION.get(file.getContentType());
        String fileName = UUID.randomUUID() + extension;
        Path destination = imageUploadDir.resolve(fileName).normalize();

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store image");
        }

        String baseUrl = publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        String url = baseUrl + "/uploads/images/" + fileName;

        return new StoredImage(
                file.getOriginalFilename(),
                fileName,
                file.getContentType(),
                file.getSize(),
                url
        );
    }

    public void deleteImage(String storedFileName) {
        Path target = imageUploadDir.resolve(storedFileName).normalize();

        try {
            Files.deleteIfExists(target);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete image");
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image file is required");
        }

        String contentType = file.getContentType();

        if (!StringUtils.hasText(contentType) || !CONTENT_TYPE_TO_EXTENSION.containsKey(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG, WEBP, and GIF images are allowed");
        }

        if (file.getSize() > properties.storage().maxImageSizeBytes()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image exceeds the maximum allowed size");
        }
    }

    public record StoredImage(
            String originalFileName,
            String storedFileName,
            String contentType,
            long sizeBytes,
            String url
    ) {
    }
}
