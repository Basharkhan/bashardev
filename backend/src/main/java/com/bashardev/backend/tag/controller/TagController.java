package com.bashardev.backend.tag.controller;

import com.bashardev.backend.tag.dto.TagResponse;
import com.bashardev.backend.tag.service.TagService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public List<TagResponse> getTags() {
        return tagService.getTags();
    }
}
