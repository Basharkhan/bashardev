package com.bashardev.backend.blog.controller;

import com.bashardev.backend.blog.dto.BlogPostRequest;
import com.bashardev.backend.blog.dto.BlogPostResponse;
import com.bashardev.backend.blog.service.BlogPostService;
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
@RequestMapping("/api/admin/blog-posts")
public class AdminBlogPostController {

    private final BlogPostService blogPostService;

    public AdminBlogPostController(BlogPostService blogPostService) {
        this.blogPostService = blogPostService;
    }

    @GetMapping
    public List<BlogPostResponse> getBlogPosts() {
        return blogPostService.getAdminBlogPosts();
    }

    @GetMapping("/{id}")
    public BlogPostResponse getBlogPostById(@PathVariable Long id) {
        return blogPostService.getAdminBlogPostById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BlogPostResponse createBlogPost(@Valid @RequestBody BlogPostRequest request) {
        return blogPostService.createBlogPost(request);
    }

    @PutMapping("/{id}")
    public BlogPostResponse updateBlogPost(@PathVariable Long id, @Valid @RequestBody BlogPostRequest request) {
        return blogPostService.updateBlogPost(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBlogPost(@PathVariable Long id) {
        blogPostService.deleteBlogPost(id);
    }
}
