package com.bashardev.backend.project.controller;

import com.bashardev.backend.project.dto.ProjectResponse;
import com.bashardev.backend.project.service.ProjectService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectResponse> getProjects() {
        return projectService.getPublishedProjects();
    }

    @GetMapping("/slug/{slug}")
    public ProjectResponse getProjectBySlug(@PathVariable String slug) {
        return projectService.getPublishedProjectBySlug(slug);
    }
}
