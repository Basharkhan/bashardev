package com.bashardev.backend.project.controller;

import com.bashardev.backend.common.web.FieldAwareResponseStatusException;
import com.bashardev.backend.common.web.GlobalExceptionHandler;
import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.project.dto.ProjectRequest;
import com.bashardev.backend.project.dto.ProjectSummaryResponse;
import com.bashardev.backend.project.entity.ProjectStatus;
import com.bashardev.backend.project.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminProjectControllerTest {

    @Mock
    private ProjectService projectService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(new AdminProjectController(projectService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    void getProjectsBindsPagingAndFilterParams() throws Exception {
        when(projectService.getAdminProjects(1, 5, "portfolio", ProjectStatus.PUBLISHED, true))
                .thenReturn(new PagedResponse<>(
                        List.of(new ProjectSummaryResponse(
                                1L,
                                "Portfolio Platform",
                                "portfolio-platform",
                                "Summary",
                                "https://example.com/cover.jpg",
                                "PUBLISHED",
                                true,
                                Instant.parse("2026-05-16T10:00:00Z"),
                                1,
                                Instant.parse("2026-05-16T10:00:00Z")
                        )),
                        1,
                        5,
                        1,
                        1,
                        false
                ));

        mockMvc.perform(get("/api/admin/projects")
                        .param("page", "1")
                        .param("size", "5")
                        .param("search", "portfolio")
                        .param("status", "PUBLISHED")
                        .param("featured", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].slug").value("portfolio-platform"))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(5));

        verify(projectService).getAdminProjects(1, 5, "portfolio", ProjectStatus.PUBLISHED, true);
    }

    @Test
    void createProjectReturnsBeanValidationErrors() throws Exception {
        ProjectRequest invalidRequest = new ProjectRequest(
                "",
                "",
                "",
                null,
                null,
                List.of(),
                null,
                null,
                List.of(),
                false,
                ProjectStatus.DRAFT,
                null,
                -1,
                null,
                null
        );

        mockMvc.perform(post("/api/admin/projects")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.title").value("Title is required"))
                .andExpect(jsonPath("$.fieldErrors.slug").value("Slug is required"))
                .andExpect(jsonPath("$.fieldErrors.summary").value("Summary is required"))
                .andExpect(jsonPath("$.fieldErrors.displayOrder").value("Display order must be non-negative"));
    }

    @Test
    void createProjectSerializesFieldAwareErrors() throws Exception {
        when(projectService.createProject(any(ProjectRequest.class)))
                .thenThrow(new FieldAwareResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Project slug already exists",
                        Map.of("slug", "Project slug already exists")
                ));

        ProjectRequest request = new ProjectRequest(
                "Portfolio Platform",
                "portfolio-platform",
                "Summary",
                "## Overview",
                null,
                List.of(),
                null,
                null,
                List.of(),
                false,
                ProjectStatus.DRAFT,
                null,
                0,
                null,
                null
        );

        mockMvc.perform(post("/api/admin/projects")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Project slug already exists"))
                .andExpect(jsonPath("$.fieldErrors.slug").value("Project slug already exists"));
    }
}
