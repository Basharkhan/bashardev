package com.bashardev.backend.project.controller;

import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.project.dto.ProjectResponse;
import com.bashardev.backend.project.dto.ProjectSummaryResponse;
import com.bashardev.backend.project.service.ProjectService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public PagedResponse<ProjectSummaryResponse> getProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return projectService.getPublishedProjects(page, size);
    }

    @GetMapping("/slug/{slug}")
    public ProjectResponse getProjectBySlug(@PathVariable String slug) {
        return projectService.getPublishedProjectBySlug(slug);
    }
}
