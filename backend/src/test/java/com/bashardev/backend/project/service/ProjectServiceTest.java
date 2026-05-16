package com.bashardev.backend.project.service;

import com.bashardev.backend.common.web.FieldAwareResponseStatusException;
import com.bashardev.backend.project.dto.ProjectGalleryItemRequest;
import com.bashardev.backend.project.dto.ProjectRequest;
import com.bashardev.backend.project.dto.ProjectResponse;
import com.bashardev.backend.project.dto.ProjectTechStackItemRequest;
import com.bashardev.backend.project.entity.Project;
import com.bashardev.backend.project.entity.ProjectStatus;
import com.bashardev.backend.project.repository.ProjectRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void createProjectNormalizesSlugAndPersistsOrderedStructuredFields() {
        when(projectRepository.findBySlug("portfolio-platform")).thenReturn(Optional.empty());
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project project = invocation.getArgument(0);
            project.setId(10L);
            project.setCreatedAt(Instant.parse("2026-05-16T10:00:00Z"));
            project.setUpdatedAt(Instant.parse("2026-05-16T10:00:00Z"));
            return project;
        });

        ProjectResponse response = projectService.createProject(new ProjectRequest(
                "Portfolio Platform",
                "  Portfolio Platform  ",
                "A portfolio and CMS.",
                "## Overview",
                "https://example.com/cover.jpg",
                List.of(
                        new ProjectGalleryItemRequest("https://example.com/2.jpg", "Second"),
                        new ProjectGalleryItemRequest("https://example.com/1.jpg", "First")
                ),
                "https://example.com",
                "https://github.com/example/repo",
                List.of(
                        new ProjectTechStackItemRequest("Spring Boot"),
                        new ProjectTechStackItemRequest("React")
                ),
                true,
                ProjectStatus.PUBLISHED,
                Instant.parse("2026-05-16T09:00:00Z"),
                2,
                "SEO Title",
                "SEO Description"
        ));

        ArgumentCaptor<Project> projectCaptor = ArgumentCaptor.forClass(Project.class);
        verify(projectRepository).save(projectCaptor.capture());
        Project savedProject = projectCaptor.getValue();

        assertThat(savedProject.getSlug()).isEqualTo("portfolio-platform");
        assertThat(savedProject.getGalleryItems())
                .extracting(item -> item.getPosition() + ":" + item.getImageUrl())
                .containsExactly(
                        "0:https://example.com/2.jpg",
                        "1:https://example.com/1.jpg"
                );
        assertThat(savedProject.getTechStackItems())
                .extracting(item -> item.getPosition() + ":" + item.getName())
                .containsExactly(
                        "0:Spring Boot",
                        "1:React"
                );
        assertThat(response.slug()).isEqualTo("portfolio-platform");
        assertThat(response.gallery())
                .extracting(item -> item.position() + ":" + item.imageUrl())
                .containsExactly(
                        "0:https://example.com/2.jpg",
                        "1:https://example.com/1.jpg"
                );
        assertThat(response.techStack())
                .extracting(item -> item.position() + ":" + item.name())
                .containsExactly(
                        "0:Spring Boot",
                        "1:React"
                );
    }

    @Test
    void createProjectReturnsFieldAwareConflictForDuplicateSlug() {
        Project existingProject = new Project();
        existingProject.setId(99L);
        existingProject.setSlug("portfolio-platform");
        when(projectRepository.findBySlug("portfolio-platform")).thenReturn(Optional.of(existingProject));

        assertThatThrownBy(() -> projectService.createProject(validRequest()))
                .isInstanceOf(FieldAwareResponseStatusException.class)
                .satisfies(throwable -> {
                    FieldAwareResponseStatusException exception = (FieldAwareResponseStatusException) throwable;
                    assertThat(exception.getStatusCode().value()).isEqualTo(409);
                    assertThat(exception.getFieldErrors()).containsEntry("slug", "Project slug already exists");
                });

        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void createProjectRejectsInvalidPublishState() {
        when(projectRepository.findBySlug("portfolio-platform")).thenReturn(Optional.empty());
        ProjectRequest invalidRequest = new ProjectRequest(
                "Portfolio Platform",
                "portfolio-platform",
                "A portfolio and CMS.",
                "## Overview",
                null,
                List.of(),
                null,
                null,
                List.of(),
                false,
                ProjectStatus.PUBLISHED,
                null,
                0,
                null,
                null
        );

        assertThatThrownBy(() -> projectService.createProject(invalidRequest))
                .isInstanceOf(FieldAwareResponseStatusException.class)
                .satisfies(throwable -> {
                    FieldAwareResponseStatusException exception = (FieldAwareResponseStatusException) throwable;
                    assertThat(exception.getFieldErrors())
                            .containsEntry("publishedAt", "Published date is required when status is published");
                });
    }

    @Test
    void createProjectRejectsInvalidUrls() {
        when(projectRepository.findBySlug("portfolio-platform")).thenReturn(Optional.empty());
        ProjectRequest invalidRequest = new ProjectRequest(
                "Portfolio Platform",
                "portfolio-platform",
                "A portfolio and CMS.",
                "## Overview",
                "ftp://example.com/cover.jpg",
                List.of(new ProjectGalleryItemRequest("not-a-url", "Alt")),
                "notaurl",
                "https://github.com/example/repo",
                List.of(new ProjectTechStackItemRequest("Spring Boot")),
                false,
                ProjectStatus.DRAFT,
                null,
                0,
                null,
                null
        );

        assertThatThrownBy(() -> projectService.createProject(invalidRequest))
                .isInstanceOf(FieldAwareResponseStatusException.class)
                .satisfies(throwable -> {
                    FieldAwareResponseStatusException exception = (FieldAwareResponseStatusException) throwable;
                    assertThat(exception.getFieldErrors())
                            .containsEntry("coverImageUrl", "Must be a valid http or https URL")
                            .containsEntry("liveUrl", "Must be a valid http or https URL")
                            .containsEntry("gallery[0].imageUrl", "Must be a valid http or https URL");
                });
    }

    @Test
    void publishedProjectBySlugRejectsDraftProjects() {
        Project draftProject = new Project();
        draftProject.setId(1L);
        draftProject.setSlug("portfolio-platform");
        draftProject.setStatus(ProjectStatus.DRAFT);
        when(projectRepository.findBySlug(eq("portfolio-platform"))).thenReturn(Optional.of(draftProject));

        assertThatThrownBy(() -> projectService.getPublishedProjectBySlug("portfolio-platform"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(throwable -> {
                    ResponseStatusException exception = (ResponseStatusException) throwable;
                    assertThat(exception.getStatusCode().value()).isEqualTo(404);
                });
    }

    private ProjectRequest validRequest() {
        return new ProjectRequest(
                "Portfolio Platform",
                "portfolio-platform",
                "A portfolio and CMS.",
                "## Overview",
                "https://example.com/cover.jpg",
                List.of(new ProjectGalleryItemRequest("https://example.com/1.jpg", "Preview")),
                "https://example.com",
                "https://github.com/example/repo",
                List.of(new ProjectTechStackItemRequest("Spring Boot")),
                true,
                ProjectStatus.PUBLISHED,
                Instant.parse("2026-05-16T09:00:00Z"),
                1,
                "SEO Title",
                "SEO Description"
        );
    }
}
