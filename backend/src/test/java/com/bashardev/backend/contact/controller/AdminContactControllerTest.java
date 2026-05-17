package com.bashardev.backend.contact.controller;

import com.bashardev.backend.common.web.GlobalExceptionHandler;
import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.contact.dto.ContactMessageResponse;
import com.bashardev.backend.contact.dto.ContactStatusUpdateRequest;
import com.bashardev.backend.contact.entity.ContactStatus;
import com.bashardev.backend.contact.service.ContactMessageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminContactControllerTest {

    @Mock
    private ContactMessageService service;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(new AdminContactController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    void getMessagesBindsParams() throws Exception {
        when(service.getAdminMessages(0, 10, "", null))
                .thenReturn(new PagedResponse<>(List.of(), 0, 10, 0, 0, false));

        mockMvc.perform(get("/api/admin/contact-messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray());

        verify(service).getAdminMessages(0, 10, "", null);
    }

    @Test
    void getMessagesBindsSearchAndStatus() throws Exception {
        when(service.getAdminMessages(0, 10, "john", ContactStatus.UNREAD))
                .thenReturn(new PagedResponse<>(List.of(), 0, 10, 0, 0, false));

        mockMvc.perform(get("/api/admin/contact-messages")
                        .param("search", "john")
                        .param("status", "UNREAD"))
                .andExpect(status().isOk());

        verify(service).getAdminMessages(0, 10, "john", ContactStatus.UNREAD);
    }

    @Test
    void getMessageReturnsDetail() throws Exception {
        ContactMessageResponse response = new ContactMessageResponse(
                1L, "John", "john@example.com", "Hello", "Body",
                ContactStatus.UNREAD, null, null
        );

        when(service.getMessage(1L)).thenReturn(response);

        mockMvc.perform(get("/api/admin/contact-messages/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John"));
    }

    @Test
    void getMessageReturns404ForMissingId() throws Exception {
        when(service.getMessage(999L))
                .thenThrow(new ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Contact message not found"));

        mockMvc.perform(get("/api/admin/contact-messages/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateStatusReturnsUpdatedMessage() throws Exception {
        ContactMessageResponse response = new ContactMessageResponse(
                1L, "John", "john@example.com", "Hello", "Body",
                ContactStatus.READ, null, null
        );

        when(service.updateStatus(eq(1L), any(ContactStatusUpdateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/admin/contact-messages/1/status")
                        .contentType("application/json")
                        .content("{\"status\":\"READ\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"));
    }

    @Test
    void updateStatusWithInvalidValueReturns400() throws Exception {
        mockMvc.perform(put("/api/admin/contact-messages/1/status")
                        .contentType("application/json")
                        .content("{\"status\":\"INVALID\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteMessageReturns204() throws Exception {
        mockMvc.perform(delete("/api/admin/contact-messages/1"))
                .andExpect(status().isNoContent());

        verify(service).deleteMessage(1L);
    }

    @Test
    void deleteMessageReturns404ForMissingId() throws Exception {
        doThrow(new ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Contact message not found"))
                .when(service).deleteMessage(999L);

        mockMvc.perform(delete("/api/admin/contact-messages/999"))
                .andExpect(status().isNotFound());
    }
}
