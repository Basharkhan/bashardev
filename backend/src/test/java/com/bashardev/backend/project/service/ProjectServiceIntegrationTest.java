package com.bashardev.backend.project.service;

import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.project.dto.ProjectGalleryItemRequest;
import com.bashardev.backend.project.dto.ProjectRequest;
import com.bashardev.backend.project.dto.ProjectSummaryResponse;
import com.bashardev.backend.project.entity.ProjectStatus;
import com.bashardev.backend.project.repository.ProjectRepository;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ProjectServiceIntegrationTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectRepository projectRepository;

    @BeforeEach
    void setUp() {
        projectRepository.deleteAll();
    }

    @Test
    void adminListSupportsPagingSearchStatusAndFeaturedFilters() {
        projectService.createProject(projectRequest(
                "Alpha Platform",
                "alpha-platform",
                ProjectStatus.DRAFT,
                false,
                null,
                3
        ));
        projectService.createProject(projectRequest(
                "Bravo Platform",
                "bravo-platform",
                ProjectStatus.PUBLISHED,
                true,
                Instant.parse("2026-05-16T08:00:00Z"),
                2
        ));
        projectService.createProject(projectRequest(
                "Charlie Platform",
                "charlie-platform",
                ProjectStatus.PUBLISHED,
                false,
                Instant.parse("2026-05-16T09:00:00Z"),
                1
        ));

        PagedResponse<ProjectSummaryResponse> filtered = projectService.getAdminProjects(0, 10, "bravo", ProjectStatus.PUBLISHED, true);

        assertThat(filtered.items()).hasSize(1);
        assertThat(filtered.items().getFirst().slug()).isEqualTo("bravo-platform");

        PagedResponse<ProjectSummaryResponse> paged = projectService.getAdminProjects(0, 2, null, null, null);
        assertThat(paged.items()).hasSize(2);
        assertThat(paged.totalElements()).isEqualTo(3);
        assertThat(paged.hasNext()).isTrue();
    }

    @Test
    void publicListReturnsOnlyPublishedProjectsInConfiguredSortOrder() {
        projectService.createProject(projectRequest(
                "Third",
                "third",
                ProjectStatus.PUBLISHED,
                false,
                Instant.parse("2026-05-16T08:00:00Z"),
                2
        ));
        projectService.createProject(projectRequest(
                "Draft",
                "draft",
                ProjectStatus.DRAFT,
                false,
                null,
                0
        ));
        projectService.createProject(projectRequest(
                "First",
                "first",
                ProjectStatus.PUBLISHED,
                false,
                Instant.parse("2026-05-16T10:00:00Z"),
                0
        ));
        projectService.createProject(projectRequest(
                "Second",
                "second",
                ProjectStatus.PUBLISHED,
                true,
                Instant.parse("2026-05-16T09:00:00Z"),
                1
        ));

        PagedResponse<ProjectSummaryResponse> response = projectService.getPublishedProjects(0, 10);

        assertThat(response.items())
                .extracting(ProjectSummaryResponse::slug)
                .containsExactly("first", "second", "third");
    }

    private ProjectRequest projectRequest(
            String title,
            String slug,
            ProjectStatus status,
            boolean featured,
            Instant publishedAt,
            int displayOrder
    ) {
        return new ProjectRequest(
                title,
                slug,
                title + " summary",
                "## " + title,
                "https://example.com/" + slug + ".jpg",
                List.of(new ProjectGalleryItemRequest("https://example.com/" + slug + "-1.jpg", title)),
                "https://example.com/" + slug,
                "https://github.com/example/" + slug,
                List.of(),
                featured,
                status,
                publishedAt,
                displayOrder,
                title + " SEO",
                title + " SEO description"
        );
    }
}
