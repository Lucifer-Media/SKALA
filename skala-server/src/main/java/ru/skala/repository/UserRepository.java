package ru.skala.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.skala.domain.AppUser;

import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsernameIgnoreCase(String username);
    boolean existsByUsernameIgnoreCase(String username);
}
