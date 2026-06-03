package ru.skala.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import ru.skala.domain.AuditLog;
import ru.skala.repository.AuditLogRepository;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(String username, String action, String details,
                    String ipAddress, boolean success, String errorMessage) {
        auditLogRepository.save(AuditLog.builder()
                .username(username)
                .action(action)
                .details(details)
                .ipAddress(ipAddress)
                .success(success)
                .errorMessage(errorMessage)
                .build());
    }
}
