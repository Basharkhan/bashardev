package com.bashardev.backend.common.web;

import java.util.Map;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.server.ResponseStatusException;

public class FieldAwareResponseStatusException extends ResponseStatusException {

    private final Map<String, String> fieldErrors;

    public FieldAwareResponseStatusException(
            HttpStatusCode status,
            String reason,
            Map<String, String> fieldErrors
    ) {
        super(status, reason);
        this.fieldErrors = fieldErrors;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
