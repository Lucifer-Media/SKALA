package ru.skala.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column(length = 200)
    private String displayName;

    @Column(length = 200)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private boolean enabled = true;
    private boolean locked = false;

    private int failedLoginAttempts = 0;
    private LocalDateTime lockoutUntil;
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public boolean isAccountLocked() {
        if (!locked) return false;
        if (lockoutUntil != null && LocalDateTime.now().isAfter(lockoutUntil)) {
            locked = false;
            failedLoginAttempts = 0;
            return false;
        }
        return true;
    }
}
