package com.bashardev.backend.common.web;

import com.bashardev.backend.auth.dto.LoginRequest;
import jakarta.validation.Valid;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void returnsReadableFieldValidationMessages() throws Exception {
        LoginRequest requestBody = new LoginRequest("", "");
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(requestBody, "loginRequest");
        bindingResult.addError(new FieldError("loginRequest", "username", "", false, null, null, "Username is required"));
        bindingResult.addError(new FieldError("loginRequest", "password", "", false, null, null, "Password is required"));

        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(loginMethodParameter(), bindingResult);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/auth/login");

        ResponseEntity<ApiError> response = handler.handleValidationException(exception, request);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Validation failed");
        assertThat(response.getBody().fieldErrors())
                .containsEntry("username", "Username is required")
                .containsEntry("password", "Password is required");
    }

    private MethodParameter loginMethodParameter() throws NoSuchMethodException {
        Method method = getClass().getDeclaredMethod("login", LoginRequest.class);
        return new MethodParameter(method, 0);
    }

    @SuppressWarnings("unused")
    private void login(@Valid LoginRequest request) {
    }
}
