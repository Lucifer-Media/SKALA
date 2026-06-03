package ru.skala.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ras_connections")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RasConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 255)
    private String host;

    @Column(nullable = false)
    private int port = 1545;

    @Column(length = 100)
    private String clusterUser;

    /** Пароль кластера хранится зашифрованным (AES) */
    @Column(length = 500)
    private String clusterPasswordEncrypted;

    private boolean enabled = true;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectionStatus status = ConnectionStatus.UNKNOWN;

    private LocalDateTime lastCheckedAt;
    private String lastError;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private AppUser createdBy;
}
