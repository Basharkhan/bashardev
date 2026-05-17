package com.bashardev.backend.contact.controller;

import com.bashardev.backend.contact.dto.ContactMessageRequest;
import com.bashardev.backend.contact.dto.ContactMessageResponse;
import com.bashardev.backend.contact.service.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageService service;

    public ContactController(ContactMessageService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessageResponse submit(@Valid @RequestBody ContactMessageRequest request) {
        return service.submitMessage(request);
    }
}
