package com.bashardev.backend.blog.service;

import com.bashardev.backend.blog.dto.BlogPostRequest;
import com.bashardev.backend.blog.dto.BlogPostResponse;
import com.bashardev.backend.blog.entity.BlogPost;
import com.bashardev.backend.blog.entity.BlogPostStatus;
import com.bashardev.backend.blog.repository.BlogPostRepository;
import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.media.service.MediaAssetService;
import com.bashardev.backend.tag.service.TagService;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BlogPostService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Sort PUBLISHED_SORT = Sort.by(
            Sort.Order.desc("publishedAt"),
            Sort.Order.desc("createdAt")
    );
    private static final Sort ADMIN_SORT = Sort.by(Sort.Order.desc("createdAt"));

    private final BlogPostRepository blogPostRepository;
    private final TagService tagService;
    private final MediaAssetService mediaAssetService;

    public BlogPostService(BlogPostRepository blogPostRepository, TagService tagService, MediaAssetService mediaAssetService) {
        this.blogPostRepository = blogPostRepository;
        this.tagService = tagService;
        this.mediaAssetService = mediaAssetService;
    }

    public PagedResponse<BlogPostResponse> getPublishedBlogPosts(int page, int size) {
        return PagedResponse.from(blogPostRepository.findAllByStatus(
                        BlogPostStatus.PUBLISHED,
                        PageRequest.of(normalizePage(page), normalizePageSize(size), PUBLISHED_SORT)
                )
                .map(BlogPostService::toResponse));
    }

    public BlogPostResponse getPublishedBlogPostBySlug(String slug) {
        return toResponse(blogPostRepository.findBySlug(slug)
                .filter(post -> post.getStatus() == BlogPostStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post not found")));
    }

    public PagedResponse<BlogPostResponse> getAdminBlogPosts(int page, int size) {
        return PagedResponse.from(blogPostRepository.findAll(
                PageRequest.of(normalizePage(page), normalizePageSize(size), ADMIN_SORT)
        ).map(BlogPostService::toResponse));
    }

    public BlogPostResponse getAdminBlogPostById(Long id) {
        return toResponse(findBlogPost(id));
    }

    public BlogPostResponse createBlogPost(BlogPostRequest request) {
        ensureSlugAvailable(request.slug(), null);
        BlogPost post = new BlogPost();
        apply(post, request, tagService, mediaAssetService);
        return toResponse(blogPostRepository.save(post));
    }

    public BlogPostResponse updateBlogPost(Long id, BlogPostRequest request) {
        BlogPost post = findBlogPost(id);
        ensureSlugAvailable(request.slug(), id);
        apply(post, request, tagService, mediaAssetService);
        return toResponse(blogPostRepository.save(post));
    }

    public void deleteBlogPost(Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog post not found");
        }

        blogPostRepository.deleteById(id);
    }

    private static int normalizePage(int page) {
        return Math.max(page, 0);
    }

    private static int normalizePageSize(int size) {
        if (size < 1) {
            return 1;
        }

        return Math.min(size, MAX_PAGE_SIZE);
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

    private static void apply(BlogPost post, BlogPostRequest request, TagService tagService, MediaAssetService mediaAssetService) {
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
        post.getTags().clear();
        post.getTags().addAll(tagService.resolveTags(request.tagIds()));
        post.getMediaAssets().clear();
        post.getMediaAssets().addAll(mediaAssetService.resolveMediaAssets(request.mediaAssetIds()));
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
                post.getTags().stream()
                        .sorted((left, right) -> left.getName().compareToIgnoreCase(right.getName()))
                        .map(TagService::toResponse)
                        .toList(),
                post.getMediaAssets().stream()
                        .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                        .map(MediaAssetService::toResponse)
                        .toList(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
