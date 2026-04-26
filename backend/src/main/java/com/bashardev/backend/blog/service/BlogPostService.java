package com.bashardev.backend.blog.service;

import com.bashardev.backend.blog.dto.BlogPostRequest;
import com.bashardev.backend.blog.dto.BlogPostResponse;
import com.bashardev.backend.blog.entity.BlogPost;
import com.bashardev.backend.blog.entity.BlogPostStatus;
import com.bashardev.backend.blog.repository.BlogPostRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;

    public BlogPostService(BlogPostRepository blogPostRepository) {
        this.blogPostRepository = blogPostRepository;
    }

    public List<BlogPostResponse> getPublishedBlogPosts() {
        return blogPostRepository.findAllByStatusOrderByPublishedAtDescCreatedAtDesc(BlogPostStatus.PUBLISHED)
                .stream()
                .map(BlogPostService::toResponse)
                .toList();
    }

    public BlogPostResponse getPublishedBlogPostBySlug(String slug) {
        return toResponse(blogPostRepository.findBySlug(slug)
                .filter(post -> post.getStatus() == BlogPostStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post not found")));
    }

    public List<BlogPostResponse> getAdminBlogPosts() {
        return blogPostRepository.findAll().stream()
                .sorted(Comparator.comparing(BlogPost::getCreatedAt).reversed())
                .map(BlogPostService::toResponse)
                .toList();
    }

    public BlogPostResponse getAdminBlogPostById(Long id) {
        return toResponse(findBlogPost(id));
    }

    public BlogPostResponse createBlogPost(BlogPostRequest request) {
        ensureSlugAvailable(request.slug(), null);
        BlogPost post = new BlogPost();
        apply(post, request);
        return toResponse(blogPostRepository.save(post));
    }

    public BlogPostResponse updateBlogPost(Long id, BlogPostRequest request) {
        BlogPost post = findBlogPost(id);
        ensureSlugAvailable(request.slug(), id);
        apply(post, request);
        return toResponse(blogPostRepository.save(post));
    }

    public void deleteBlogPost(Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post not found");
        }

        blogPostRepository.deleteById(id);
    }

    private BlogPost findBlogPost(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post not found"));
    }

    private void ensureSlugAvailable(String slug, Long currentId) {
        blogPostRepository.findBySlug(slug)
                .filter(existing -> currentId == null || !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Blog post slug already exists");
                });
    }

    private static void apply(BlogPost post, BlogPostRequest request) {
        post.setTitle(request.title());
        post.setSlug(request.slug());
        post.setExcerpt(request.excerpt());
        post.setContentMarkdown(request.contentMarkdown());
        post.setCoverImageUrl(request.coverImageUrl());
        post.setStatus(request.status());
        post.setFeatured(request.featured());
        post.setPublishedAt(request.publishedAt());
        post.setReadingTime(request.readingTime());
        post.setSeoTitle(request.seoTitle());
        post.setSeoDescription(request.seoDescription());
    }

    private static BlogPostResponse toResponse(BlogPost post) {
        return new BlogPostResponse(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getExcerpt(),
                post.getContentMarkdown(),
                post.getCoverImageUrl(),
                post.getStatus().name(),
                post.isFeatured(),
                post.getPublishedAt(),
                post.getReadingTime(),
                post.getSeoTitle(),
                post.getSeoDescription(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
