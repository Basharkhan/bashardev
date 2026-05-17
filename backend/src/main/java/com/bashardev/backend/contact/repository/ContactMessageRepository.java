package com.bashardev.backend.contact.repository;

import com.bashardev.backend.contact.entity.ContactMessage;
import com.bashardev.backend.contact.entity.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    @Query("""
        SELECT m FROM ContactMessage m
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(m.name)    LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(m.email)   LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(m.subject) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR m.status = :status)
        """)
    Page<ContactMessage> findFiltered(
            @Param("search") String search,
            @Param("status") ContactStatus status,
            Pageable pageable
    );

    long countByStatus(ContactStatus status);
}
