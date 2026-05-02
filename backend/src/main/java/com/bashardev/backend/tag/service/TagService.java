package com.bashardev.backend.tag.service;

import com.bashardev.backend.blog.repository.BlogPostRepository;
import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.common.web.FieldAwareResponseStatusException;
import com.bashardev.backend.tag.dto.TagRequest;
import com.bashardev.backend.tag.dto.TagResponse;
import com.bashardev.backend.tag.entity.Tag;
import com.bashardev.backend.tag.repository.TagRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TagService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final Sort ADMIN_SORT = Sort.by(
            Sort.Order.asc("name"),
            Sort.Order.asc("id")
    );

    private final TagRepository tagRepository;
    private final BlogPostRepository blogPostRepository;

    public TagService(TagRepository tagRepository, BlogPostRepository blogPostRepository) {
        this.tagRepository = tagRepository;
        this.blogPostRepository = blogPostRepository;
    }

    public List<TagResponse> getTags() {
        return tagRepository.findAllByOrderByNameAsc().stream()
                .map(TagService::toResponse)
                .toList();
    }

    public PagedResponse<TagResponse> getAdminTags(int page, int size, String search) {
        String normalizedSearch = normalizeSearch(search);

        return PagedResponse.from(tagRepository
                .findByNameContainingIgnoreCaseOrSlugContainingIgnoreCase(
                        normalizedSearch,
                        normalizedSearch,
                        PageRequest.of(normalizePage(page), normalizePageSize(size), ADMIN_SORT)
                )
                .map(TagService::toResponse));
    }

    public TagResponse getTagById(Long id) {
        return toResponse(findTag(id));
    }

    public TagResponse createTag(TagRequest request) {
        ensureNameAvailable(request.name(), null);
        ensureSlugAvailable(request.slug(), null);

        Tag tag = new Tag();
        apply(tag, request);
        return toResponse(tagRepository.save(tag));
    }

    public TagResponse updateTag(Long id, TagRequest request) {
        Tag tag = findTag(id);
        ensureNameAvailable(request.name(), id);
        ensureSlugAvailable(request.slug(), id);

        apply(tag, request);
        return toResponse(tagRepository.save(tag));
    }

    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tag not found");
        }

        if (blogPostRepository.countByTagsId(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a tag assigned to blog posts");
        }

        tagRepository.deleteById(id);
    }

    public Set<Tag> resolveTags(List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        Set<Long> distinctIds = new LinkedHashSet<>(tagIds);
        List<Tag> tags = tagRepository.findAllById(distinctIds);

        if (tags.size() != distinctIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more tags do not exist");
        }

        return new LinkedHashSet<>(tags);
    }

    private Tag findTag(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tag not found"));
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

    private static String normalizeSearch(String search) {
        if (!StringUtils.hasText(search)) {
            return "";
        }

        return search.trim();
    }

    private void ensureNameAvailable(String name, Long currentId) {
        tagRepository.findByName(name)
                .filter(existing -> currentId == null || !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new FieldAwareResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Tag name already exists",
                            Map.of("name", "Tag name already exists")
                    );
                });
    }

    private void ensureSlugAvailable(String slug, Long currentId) {
        tagRepository.findBySlug(slug)
                .filter(existing -> currentId == null || !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new FieldAwareResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Tag slug already exists",
                            Map.of("slug", "Tag slug already exists")
                    );
                });
    }

    private static void apply(Tag tag, TagRequest request) {
        tag.setName(request.name());
        tag.setSlug(request.slug());
    }

    public static TagResponse toResponse(Tag tag) {
        return new TagResponse(
                tag.getId(),
                tag.getName(),
                tag.getSlug(),
                tag.getCreatedAt(),
                tag.getUpdatedAt()
        );
    }
}
