package com.bashardev.backend.project.repository;

import com.bashardev.backend.project.entity.Project;
import com.bashardev.backend.project.entity.ProjectStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findBySlug(String slug);

    List<Project> findAllByStatusOrderByDisplayOrderAscCreatedAtDesc(ProjectStatus status);

    List<Project> findAllByFeaturedTrueAndStatusOrderByDisplayOrderAscCreatedAtDesc(ProjectStatus status);
}
