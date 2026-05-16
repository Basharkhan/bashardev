package com.bashardev.backend.project.controller;

import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.project.dto.ProjectSummaryResponse;
import com.bashardev.backend.project.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProjectControllerTest {

    @Mock
    private ProjectService projectService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(new ProjectController(projectService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    void getProjectsBindsPagingParams() throws Exception {
        when(projectService.getPublishedProjects(2, 3))
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
                        2,
                        3,
                        1,
                        1,
                        false
                ));

        mockMvc.perform(get("/api/projects")
                        .param("page", "2")
                        .param("size", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].slug").value("portfolio-platform"))
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.size").value(3));

        verify(projectService).getPublishedProjects(2, 3);
    }
}
