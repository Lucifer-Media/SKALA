package ru.skala.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(length = 1000)
    private String details;

    @Column(length = 45)
    private String ipAddress;

    private boolean success;

    @Column(length = 500)
    private String errorMessage;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
