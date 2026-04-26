package com.bashardev.backend.project.service;

import com.bashardev.backend.project.dto.ProjectRequest;
import com.bashardev.backend.project.dto.ProjectResponse;
import com.bashardev.backend.project.entity.Project;
import com.bashardev.backend.project.entity.ProjectStatus;
import com.bashardev.backend.project.repository.ProjectRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<ProjectResponse> getPublishedProjects() {
        return projectRepository.findAllByStatusOrderByDisplayOrderAscCreatedAtDesc(ProjectStatus.PUBLISHED)
                .stream()
                .map(ProjectService::toResponse)
                .toList();
    }

    public ProjectResponse getPublishedProjectBySlug(String slug) {
        return toResponse(projectRepository.findBySlug(slug)
                .filter(project -> project.getStatus() == ProjectStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found")));
    }

    public List<ProjectResponse> getAdminProjects() {
        return projectRepository.findAll().stream()
                .sorted(Comparator.comparing(Project::getCreatedAt).reversed())
                .map(ProjectService::toResponse)
                .toList();
    }

    public ProjectResponse getAdminProjectById(Long id) {
        return toResponse(findProject(id));
    }

    public ProjectResponse createProject(ProjectRequest request) {
        ensureSlugAvailable(request.slug(), null);
        Project project = new Project();
        apply(project, request);
        return toResponse(projectRepository.save(project));
    }

    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findProject(id);
        ensureSlugAvailable(request.slug(), id);
        apply(project, request);
        return toResponse(projectRepository.save(project));
    }

    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }

        projectRepository.deleteById(id);
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    private void ensureSlugAvailable(String slug, Long currentId) {
        projectRepository.findBySlug(slug)
                .filter(existing -> currentId == null || !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Project slug already exists");
                });
    }

    private static void apply(Project project, ProjectRequest request) {
        project.setTitle(request.title());
        project.setSlug(request.slug());
        project.setSummary(request.summary());
        project.setContentMarkdown(request.contentMarkdown());
        project.setCoverImageUrl(request.coverImageUrl());
        project.setGalleryImageUrls(request.galleryImageUrls());
        project.setLiveUrl(request.liveUrl());
        project.setRepositoryUrl(request.repositoryUrl());
        project.setTechStack(request.techStack());
        project.setFeatured(request.featured());
        project.setStatus(request.status());
        project.setPublishedAt(request.publishedAt());
        project.setDisplayOrder(request.displayOrder());
        project.setSeoTitle(request.seoTitle());
        project.setSeoDescription(request.seoDescription());
    }

    private static ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getSlug(),
                project.getSummary(),
                project.getContentMarkdown(),
                project.getCoverImageUrl(),
                project.getGalleryImageUrls(),
                project.getLiveUrl(),
                project.getRepositoryUrl(),
                project.getTechStack(),
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
}
