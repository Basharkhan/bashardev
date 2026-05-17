package com.bashardev.backend.contact.service;

import com.bashardev.backend.common.web.PagedResponse;
import com.bashardev.backend.contact.dto.ContactMessageRequest;
import com.bashardev.backend.contact.dto.ContactMessageResponse;
import com.bashardev.backend.contact.dto.ContactStatusUpdateRequest;
import com.bashardev.backend.contact.entity.ContactMessage;
import com.bashardev.backend.contact.entity.ContactStatus;
import com.bashardev.backend.contact.repository.ContactMessageRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContactMessageServiceTest {

    @Mock
    private ContactMessageRepository repository;

    @InjectMocks
    private ContactMessageService service;

    @Test
    void submitMessageSetsUnreadStatus() {
        ContactMessageRequest request = new ContactMessageRequest(
                "John Doe", "john@example.com", "Hello", "Message body"
        );

        ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
        ContactMessage saved = new ContactMessage();
        saved.setId(1L);
        saved.setName("John Doe");
        saved.setEmail("john@example.com");
        saved.setSubject("Hello");
        saved.setMessage("Message body");
        saved.setStatus(ContactStatus.UNREAD);

        when(repository.save(any())).thenReturn(saved);

        ContactMessageResponse response = service.submitMessage(request);

        assertThat(response.status()).isEqualTo(ContactStatus.UNREAD);
        assertThat(response.name()).isEqualTo("John Doe");
        assertThat(response.email()).isEqualTo("john@example.com");
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(ContactStatus.UNREAD);
    }

    @Test
    void submitMessageTrimsFields() {
        ContactMessageRequest request = new ContactMessageRequest(
                "  John Doe  ", "  john@example.com  ", "  Hello  ", "  Body  "
        );

        ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
        ContactMessage saved = new ContactMessage();
        saved.setId(1L);
        saved.setName("John Doe");

        when(repository.save(any())).thenReturn(saved);

        service.submitMessage(request);

        verify(repository).save(captor.capture());
        ContactMessage captured = captor.getValue();
        assertThat(captured.getName()).isEqualTo("John Doe");
        assertThat(captured.getEmail()).isEqualTo("john@example.com");
        assertThat(captured.getSubject()).isEqualTo("Hello");
        assertThat(captured.getMessage()).isEqualTo("Body");
    }

    @Test
    void getAdminMessagesReturnsPagedResponse() {
        ContactMessage msg = new ContactMessage();
        msg.setId(1L);
        msg.setName("Jane");
        msg.setEmail("jane@example.com");
        msg.setSubject("Test");
        msg.setMessage("Body");
        msg.setStatus(ContactStatus.UNREAD);

        when(repository.findFiltered(isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(msg)));

        PagedResponse<ContactMessageResponse> result = service.getAdminMessages(0, 10, "", null);

        assertThat(result.items()).hasSize(1);
        assertThat(result.totalElements()).isEqualTo(1);
        assertThat(result.items().get(0).name()).isEqualTo("Jane");
    }

    @Test
    void getAdminMessagesFiltersByStatus() {
        when(repository.findFiltered(isNull(), eq(ContactStatus.UNREAD), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        service.getAdminMessages(0, 10, "", ContactStatus.UNREAD);

        verify(repository).findFiltered(isNull(), eq(ContactStatus.UNREAD), any(Pageable.class));
    }

    @Test
    void getMessageThrowsNotFoundForMissingId() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getMessage(999L))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status").isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }

    @Test
    void updateStatusChangesStatus() {
        ContactMessage msg = new ContactMessage();
        msg.setId(1L);
        msg.setStatus(ContactStatus.UNREAD);

        when(repository.findById(1L)).thenReturn(Optional.of(msg));
        when(repository.save(msg)).thenReturn(msg);

        ContactMessageResponse response = service.updateStatus(1L, new ContactStatusUpdateRequest(ContactStatus.READ));

        assertThat(response.status()).isEqualTo(ContactStatus.READ);
        assertThat(msg.getStatus()).isEqualTo(ContactStatus.READ);
    }

    @Test
    void deleteMessageRemovesExistingMessage() {
        when(repository.existsById(1L)).thenReturn(true);

        service.deleteMessage(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    void deleteMessageThrowsNotFoundForMissingId() {
        when(repository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> service.deleteMessage(999L))
                .isInstanceOf(ResponseStatusException.class)
                .extracting("status").isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND);
    }
}
