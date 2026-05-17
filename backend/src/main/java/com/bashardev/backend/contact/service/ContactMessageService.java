package com.bashardev.backend.contact.service;

import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.contact.dto.ContactMessageRequest;
import com.bashardev.backend.contact.dto.ContactMessageResponse;
import com.bashardev.backend.contact.dto.ContactStatusUpdateRequest;
import com.bashardev.backend.contact.entity.ContactMessage;
import com.bashardev.backend.contact.entity.ContactStatus;
import com.bashardev.backend.contact.repository.ContactMessageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ContactMessageService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final Sort ADMIN_SORT = Sort.by(
            Sort.Order.desc("createdAt"),
            Sort.Order.desc("id")
    );

    private final ContactMessageRepository repository;

    public ContactMessageService(ContactMessageRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ContactMessageResponse submitMessage(ContactMessageRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.name().trim());
        message.setEmail(request.email().trim());
        message.setSubject(request.subject().trim());
        message.setMessage(request.message().trim());
        message.setStatus(ContactStatus.UNREAD);

        return toResponse(repository.save(message));
    }

    public PagedResponse<ContactMessageResponse> getAdminMessages(int page, int size, String search, ContactStatus status) {
        String normalizedSearch = normalizeSearch(search);

        return PagedResponse.from(repository
                .findFiltered(
                        normalizedSearch.isEmpty() ? null : normalizedSearch,
                        status,
                        PageRequest.of(normalizePage(page), normalizePageSize(size), ADMIN_SORT)
                )
                .map(ContactMessageService::toResponse));
    }

    public ContactMessageResponse getMessage(Long id) {
        return toResponse(findMessage(id));
    }

    @Transactional
    public ContactMessageResponse updateStatus(Long id, ContactStatusUpdateRequest request) {
        ContactMessage message = findMessage(id);
        message.setStatus(request.status());
        return toResponse(repository.save(message));
    }

    @Transactional
    public void deleteMessage(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact message not found");
        }

        repository.deleteById(id);
    }

    private ContactMessage findMessage(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact message not found"));
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

    public static ContactMessageResponse toResponse(ContactMessage message) {
        return new ContactMessageResponse(
                message.getId(),
                message.getName(),
                message.getEmail(),
                message.getSubject(),
                message.getMessage(),
                message.getStatus(),
                message.getCreatedAt(),
                message.getUpdatedAt()
        );
    }
}
