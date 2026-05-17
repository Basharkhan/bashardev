package com.bashardev.backend.contact.controller;

import com.bashardev.backend.contact.dto.ContactMessageResponse;
import com.bashardev.backend.contact.dto.ContactStatusUpdateRequest;
import com.bashardev.backend.contact.entity.ContactStatus;
import com.bashardev.backend.contact.service.ContactMessageService;
import com.bashardev.backend.common.web.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/contact-messages")
public class AdminContactController {

    private final ContactMessageService service;

    public AdminContactController(ContactMessageService service) {
        this.service = service;
    }

    @GetMapping
    public PagedResponse<ContactMessageResponse> getMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) ContactStatus status
    ) {
        return service.getAdminMessages(page, size, search, status);
    }

    @GetMapping("/{id}")
    public ContactMessageResponse getMessage(@PathVariable Long id) {
        return service.getMessage(id);
    }

    @PutMapping("/{id}/status")
    public ContactMessageResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ContactStatusUpdateRequest request
    ) {
        return service.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(@PathVariable Long id) {
        service.deleteMessage(id);
    }
}
