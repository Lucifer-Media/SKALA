package ru.skala.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.skala.config.SkalaProperties;
import ru.skala.domain.AppUser;
import ru.skala.domain.UserRole;
import ru.skala.repository.UserRepository;
import ru.skala.security.JwtService;
import ru.skala.security.SkalaUserDetailsService;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final SkalaUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final SkalaProperties properties;

    @Transactional
    public Map<String, String> login(String username, String password, String ipAddress) {
        AppUser user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new BadCredentialsException("Неверный логин или пароль"));

        if (user.isAccountLocked()) {
            auditService.log(username, "LOGIN_BLOCKED", "Учётная запись заблокирована", ipAddress, false, null);
            throw new LockedException("Учётная запись временно заблокирована");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));
        } catch (BadCredentialsException e) {
            handleFailedLogin(user, ipAddress);
            throw new BadCredentialsException("Неверный логин или пароль");
        }

        // Сбрасываем счётчик неудачных попыток
        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String token = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        auditService.log(username, "LOGIN", null, ipAddress, true, null);
        log.info("Пользователь {} выполнил вход (ip: {})", username, ipAddress);

        return Map.of("token", token, "refreshToken", refreshToken);
    }

    @Transactional
    public void createInitialAdmin(String username, String password) {
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            return;
        }
        AppUser admin = AppUser.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(password))
                .displayName("Суперадминистратор")
                .role(UserRole.SUPERADMIN)
                .enabled(true)
                .build();
        userRepository.save(admin);
        log.info("Создан начальный пользователь-администратор: {}", username);
    }

    private void handleFailedLogin(AppUser user, String ipAddress) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);
        if (attempts >= properties.getSecurity().getMaxLoginAttempts()) {
            user.setLocked(true);
            user.setLockoutUntil(LocalDateTime.now()
                    .plusMinutes(properties.getSecurity().getLockoutDurationMinutes()));
            log.warn("Пользователь {} заблокирован после {} неудачных попыток", user.getUsername(), attempts);
        }
        userRepository.save(user);
        auditService.log(user.getUsername(), "LOGIN_FAILED",
                "Попытка " + attempts, ipAddress, false, null);
    }
}
