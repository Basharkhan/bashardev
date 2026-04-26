package com.bashardev.backend.blog.controller;

import com.bashardev.backend.blog.dto.BlogPostResponse;
import com.bashardev.backend.blog.service.BlogPostService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/blog-posts")
public class BlogPostController {

    private final BlogPostService blogPostService;

    public BlogPostController(BlogPostService blogPostService) {
        this.blogPostService = blogPostService;
    }

    @GetMapping
    public List<BlogPostResponse> getBlogPosts() {
        return blogPostService.getPublishedBlogPosts();
    }

    @GetMapping("/slug/{slug}")
    public BlogPostResponse getBlogPostBySlug(@PathVariable String slug) {
        return blogPostService.getPublishedBlogPostBySlug(slug);
    }
}
