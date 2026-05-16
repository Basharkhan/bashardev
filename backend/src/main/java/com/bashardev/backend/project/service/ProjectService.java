package com.bashardev.backend.project.service;

import com.bashardev.backend.common.web.FieldAwareResponseStatusException;
import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.project.dto.ProjectGalleryItemRequest;
import com.bashardev.backend.project.dto.ProjectGalleryItemResponse;
import com.bashardev.backend.project.dto.ProjectRequest;
import com.bashardev.backend.project.dto.ProjectResponse;
import com.bashardev.backend.project.dto.ProjectSummaryResponse;
import com.bashardev.backend.project.dto.ProjectTechStackItemRequest;
import com.bashardev.backend.project.dto.ProjectTechStackItemResponse;
import com.bashardev.backend.project.entity.Project;
import com.bashardev.backend.project.entity.ProjectGalleryItem;
import com.bashardev.backend.project.entity.ProjectStatus;
import com.bashardev.backend.project.entity.ProjectTechStackItem;
import com.bashardev.backend.project.repository.ProjectRepository;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ProjectService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Sort PUBLIC_SORT = Sort.by(
            Sort.Order.asc("displayOrder"),
            Sort.Order.desc("publishedAt"),
            Sort.Order.desc("createdAt")
    );
    private static final Sort ADMIN_SORT = Sort.by(
            Sort.Order.desc("updatedAt"),
            Sort.Order.desc("id")
    );

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public PagedResponse<ProjectSummaryResponse> getPublishedProjects(int page, int size) {
        return PagedResponse.from(projectRepository.findAll(
                hasStatus(ProjectStatus.PUBLISHED),
                PageRequest.of(normalizePage(page), normalizePageSize(size), PUBLIC_SORT)
        ).map(ProjectService::toSummaryResponse));
    }

    public ProjectResponse getPublishedProjectBySlug(String slug) {
        return toResponse(projectRepository.findBySlug(normalizeSlug(slug))
                .filter(project -> project.getStatus() == ProjectStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found")));
    }

    public PagedResponse<ProjectSummaryResponse> getAdminProjects(
            int page,
            int size,
            String search,
            ProjectStatus status,
            Boolean featured
    ) {
        return PagedResponse.from(projectRepository.findAll(
                adminFilters(search, status, featured),
                PageRequest.of(normalizePage(page), normalizePageSize(size), ADMIN_SORT)
        ).map(ProjectService::toSummaryResponse));
    }

    public ProjectResponse getAdminProjectById(Long id) {
        return toResponse(findProject(id));
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        String normalizedSlug = normalizeSlug(request.slug());
        ensureSlugPresent(normalizedSlug);
        ensureSlugAvailable(normalizedSlug, null);
        validateRequest(request);

        Project project = new Project();
        apply(project, request, normalizedSlug);
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findProject(id);
        String normalizedSlug = normalizeSlug(request.slug());
        ensureSlugPresent(normalizedSlug);
        ensureSlugAvailable(normalizedSlug, id);
        validateRequest(request);

        apply(project, request, normalizedSlug);
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }

        projectRepository.deleteById(id);
    }

    private static Specification<Project> hasStatus(ProjectStatus status) {
        return (root, query, builder) -> builder.equal(root.get("status"), status);
    }

    private static Specification<Project> adminFilters(String search, ProjectStatus status, Boolean featured) {
        Specification<Project> specification = Specification.unrestricted();

        String normalizedSearch = normalizeSearch(search);
        if (StringUtils.hasText(normalizedSearch)) {
            String pattern = "%" + normalizedSearch.toLowerCase() + "%";
            specification = specification.and((root, query, builder) -> builder.or(
                    builder.like(builder.lower(root.get("title")), pattern),
                    builder.like(builder.lower(root.get("slug")), pattern)
            ));
        }

        if (status != null) {
            specification = specification.and((root, query, builder) -> builder.equal(root.get("status"), status));
        }

        if (featured != null) {
            specification = specification.and((root, query, builder) -> builder.equal(root.get("featured"), featured));
        }

        return specification;
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

    private static String normalizeSlug(String slug) {
        if (slug == null) {
            return "";
        }

        return slug.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    private static String normalizeText(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        return value.trim();
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    private void ensureSlugPresent(String slug) {
        if (!StringUtils.hasText(slug)) {
            throw new FieldAwareResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Slug is required",
                    Map.of("slug", "Slug is required")
            );
        }
    }

    private void ensureSlugAvailable(String slug, Long currentId) {
        projectRepository.findBySlug(slug)
                .filter(existing -> currentId == null || !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new FieldAwareResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Project slug already exists",
                            Map.of("slug", "Project slug already exists")
                    );
                });
    }

    private void validateRequest(ProjectRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        validateUrl("coverImageUrl", request.coverImageUrl(), fieldErrors);
        validateUrl("liveUrl", request.liveUrl(), fieldErrors);
        validateUrl("repositoryUrl", request.repositoryUrl(), fieldErrors);
        validatePublishState(request, fieldErrors);
        validateGallery(request.gallery(), fieldErrors);
        validateTechStack(request.techStack(), fieldErrors);

        if (!fieldErrors.isEmpty()) {
            String message = fieldErrors.size() == 1
                    ? fieldErrors.values().iterator().next()
                    : "Validation failed";
            throw new FieldAwareResponseStatusException(HttpStatus.BAD_REQUEST, message, fieldErrors);
        }
    }

    private void validateUrl(String field, String value, Map<String, String> fieldErrors) {
        String normalizedValue = normalizeText(value);
        if (normalizedValue == null) {
            return;
        }

        try {
            URI uri = new URI(normalizedValue);
            String scheme = uri.getScheme();
            if (!Objects.equals(scheme, "http") && !Objects.equals(scheme, "https")) {
                fieldErrors.put(field, "Must be a valid http or https URL");
            }
        } catch (URISyntaxException ex) {
            fieldErrors.put(field, "Must be a valid http or https URL");
        }
    }

    private void validatePublishState(ProjectRequest request, Map<String, String> fieldErrors) {
        if (request.status() == ProjectStatus.PUBLISHED && request.publishedAt() == null) {
            fieldErrors.put("publishedAt", "Published date is required when status is published");
        }

        if (request.status() != ProjectStatus.PUBLISHED && request.publishedAt() != null) {
            fieldErrors.put("publishedAt", "Published date is only allowed for published projects");
        }
    }

    private void validateGallery(List<ProjectGalleryItemRequest> gallery, Map<String, String> fieldErrors) {
        if (gallery == null) {
            return;
        }

        for (int index = 0; index < gallery.size(); index++) {
            ProjectGalleryItemRequest item = gallery.get(index);
            if (item == null) {
                fieldErrors.put("gallery[" + index + "]", "Gallery item is required");
                continue;
            }

            validateUrl("gallery[" + index + "].imageUrl", item.imageUrl(), fieldErrors);
        }
    }

    private void validateTechStack(List<ProjectTechStackItemRequest> techStack, Map<String, String> fieldErrors) {
        if (techStack == null) {
            return;
        }

        for (int index = 0; index < techStack.size(); index++) {
            ProjectTechStackItemRequest item = techStack.get(index);
            if (item == null) {
                fieldErrors.put("techStack[" + index + "]", "Tech stack item is required");
            }
        }
    }

    private static void apply(Project project, ProjectRequest request, String normalizedSlug) {
        project.setTitle(request.title().trim());
        project.setSlug(normalizedSlug);
        project.setSummary(request.summary().trim());
        project.setContentMarkdown(normalizeText(request.contentMarkdown()));
        project.setCoverImageUrl(normalizeText(request.coverImageUrl()));
        project.setLiveUrl(normalizeText(request.liveUrl()));
        project.setRepositoryUrl(normalizeText(request.repositoryUrl()));
        project.setFeatured(request.featured());
        project.setStatus(request.status());
        project.setPublishedAt(request.publishedAt());
        project.setDisplayOrder(request.displayOrder());
        project.setSeoTitle(normalizeText(request.seoTitle()));
        project.setSeoDescription(normalizeText(request.seoDescription()));

        project.getGalleryItems().clear();
        populateGallery(project, request.gallery());

        project.getTechStackItems().clear();
        populateTechStack(project, request.techStack());
    }

    private static void populateGallery(Project project, List<ProjectGalleryItemRequest> gallery) {
        if (gallery == null || gallery.isEmpty()) {
            return;
        }

        List<ProjectGalleryItem> items = new ArrayList<>();
        for (int index = 0; index < gallery.size(); index++) {
            ProjectGalleryItemRequest item = gallery.get(index);
            ProjectGalleryItem galleryItem = new ProjectGalleryItem();
            galleryItem.setProject(project);
            galleryItem.setPosition(index);
            galleryItem.setImageUrl(item.imageUrl().trim());
            galleryItem.setAltText(normalizeText(item.altText()));
            items.add(galleryItem);
        }
        project.getGalleryItems().addAll(items);
    }

    private static void populateTechStack(Project project, List<ProjectTechStackItemRequest> techStack) {
        if (techStack == null || techStack.isEmpty()) {
            return;
        }

        List<ProjectTechStackItem> items = new ArrayList<>();
        for (int index = 0; index < techStack.size(); index++) {
            ProjectTechStackItemRequest item = techStack.get(index);
            ProjectTechStackItem techStackItem = new ProjectTechStackItem();
            techStackItem.setProject(project);
            techStackItem.setPosition(index);
            techStackItem.setName(item.name().trim());
            items.add(techStackItem);
        }
        project.getTechStackItems().addAll(items);
    }

    private static ProjectSummaryResponse toSummaryResponse(Project project) {
        return new ProjectSummaryResponse(
                project.getId(),
                project.getTitle(),
                project.getSlug(),
                project.getSummary(),
                project.getCoverImageUrl(),
                project.getStatus().name(),
                project.isFeatured(),
                project.getPublishedAt(),
                project.getDisplayOrder(),
                project.getUpdatedAt()
        );
    }

    private static ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getSlug(),
                project.getSummary(),
                project.getContentMarkdown(),
                project.getCoverImageUrl(),
                project.getGalleryItems().stream()
                        .map(ProjectService::toGalleryItemResponse)
                        .toList(),
                project.getLiveUrl(),
                project.getRepositoryUrl(),
                project.getTechStackItems().stream()
                        .map(ProjectService::toTechStackItemResponse)
                        .toList(),
                project.isFeatured(),
                project.getStatus().name(),
                project.getPublishedAt(),
                project.getDisplayOrder(),
                project.getSeoTitle(),
                project.getSeoDescription(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    private static ProjectGalleryItemResponse toGalleryItemResponse(ProjectGalleryItem item) {
        return new ProjectGalleryItemResponse(
                item.getId(),
                item.getPosition(),
                item.getImageUrl(),
                item.getAltText()
        );
    }

    private static ProjectTechStackItemResponse toTechStackItemResponse(ProjectTechStackItem item) {
        return new ProjectTechStackItemResponse(
                item.getId(),
                item.getPosition(),
                item.getName()
        );
    }
}
