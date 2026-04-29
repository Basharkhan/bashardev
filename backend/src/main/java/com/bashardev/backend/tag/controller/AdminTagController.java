package com.bashardev.backend.tag.controller;

import com.bashardev.backend.tag.dto.TagRequest;
import com.bashardev.backend.tag.dto.TagResponse;
import com.bashardev.backend.tag.service.TagService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/tags")
public class AdminTagController {

    private final TagService tagService;

    public AdminTagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public List<TagResponse> getTags() {
        return tagService.getTags();
    }

    @GetMapping("/{id}")
    public TagResponse getTagById(@PathVariable Long id) {
        return tagService.getTagById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TagResponse createTag(@Valid @RequestBody TagRequest request) {
        return tagService.createTag(request);
    }

    @PutMapping("/{id}")
    public TagResponse updateTag(@PathVariable Long id, @Valid @RequestBody TagRequest request) {
        return tagService.updateTag(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
    }
}
