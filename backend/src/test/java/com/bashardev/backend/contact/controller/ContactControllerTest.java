package com.bashardev.backend.contact.controller;

import com.bashardev.backend.common.web.GlobalExceptionHandler;
import com.bashardev.backend.contact.dto.ContactMessageRequest;
import com.bashardev.backend.contact.dto.ContactMessageResponse;
import com.bashardev.backend.contact.entity.ContactStatus;
import com.bashardev.backend.contact.service.ContactMessageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ContactControllerTest {

    @Mock
    private ContactMessageService service;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(new ContactController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    void submitValidMessageReturns201() throws Exception {
        ContactMessageResponse response = new ContactMessageResponse(
                1L, "John", "john@example.com", "Hello", "Body",
                ContactStatus.UNREAD, null, null
        );

        when(service.submitMessage(any())).thenReturn(response);

        mockMvc.perform(post("/api/contact")
                        .contentType("application/json")
                        .content("""
                            {"name":"John","email":"john@example.com","subject":"Hello","message":"Body"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("UNREAD"));
    }

    @Test
    void submitInvalidMessageReturnsFieldErrors() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType("application/json")
                        .content("""
                            {"name":"","email":"not-an-email","subject":"","message":""}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").value("Name is required"))
                .andExpect(jsonPath("$.fieldErrors.email").value("Email must be valid"))
                .andExpect(jsonPath("$.fieldErrors.subject").value("Subject is required"))
                .andExpect(jsonPath("$.fieldErrors.message").value("Message is required"));
    }
}
