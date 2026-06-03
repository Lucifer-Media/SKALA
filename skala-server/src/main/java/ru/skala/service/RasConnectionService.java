package ru.skala.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.skala.domain.ConnectionStatus;
import ru.skala.domain.RasConnection;
import ru.skala.ras.RasClient;
import ru.skala.ras.RasClientFactory;
import ru.skala.ras.model.*;
import ru.skala.repository.RasConnectionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RasConnectionService {

    private final RasConnectionRepository connectionRepository;
    private final RasClientFactory clientFactory;
    private final AuditService auditService;

    public List<RasConnection> findAll() {
        return connectionRepository.findByEnabledTrueOrderByNameAsc();
    }

    @Transactional
    public RasConnection save(RasConnection connection) {
        return connectionRepository.save(connection);
    }

    @Transactional
    public void delete(Long id) {
        clientFactory.evictClient(id);
        connectionRepository.deleteById(id);
    }

    @Cacheable(value = "clusters", key = "#connectionId")
    public List<ClusterInfo> getClusters(Long connectionId) {
        RasConnection conn = getConnectionOrThrow(connectionId);
        return getClient(conn).getClusters();
    }

    @Cacheable(value = "infobases", key = "#connectionId + '_' + #clusterId")
    public List<InfobaseInfo> getInfobases(Long connectionId, UUID clusterId) {
        RasConnection conn = getConnectionOrThrow(connectionId);
        return getClient(conn).getInfobases(clusterId,
                conn.getClusterUser(), conn.getClusterPasswordEncrypted());
    }

    public List<SessionInfo> getSessions(Long connectionId, UUID clusterId, UUID infobaseId) {
        RasConnection conn = getConnectionOrThrow(connectionId);
        return getClient(conn).getSessions(clusterId, infobaseId,
                conn.getClusterUser(), conn.getClusterPasswordEncrypted());
    }

    @Transactional
    public void terminateSession(Long connectionId, UUID clusterId, UUID sessionId,
                                  String username, String ipAddress) {
        RasConnection conn = getConnectionOrThrow(connectionId);
        getClient(conn).terminateSession(clusterId, sessionId,
                conn.getClusterUser(), conn.getClusterPasswordEncrypted());
        auditService.log(username, "TERMINATE_SESSION",
                "connectionId=" + connectionId + " sessionId=" + sessionId,
                ipAddress, true, null);
    }

    public List<WorkingProcessInfo> getWorkingProcesses(Long connectionId, UUID clusterId) {
        RasConnection conn = getConnectionOrThrow(connectionId);
        return getClient(conn).getWorkingProcesses(clusterId,
                conn.getClusterUser(), conn.getClusterPasswordEncrypted());
    }

    public List<LockInfo> getLocks(Long connectionId, UUID clusterId, UUID infobaseId) {
        RasConnection conn = getConnectionOrThrow(connectionId);
        return getClient(conn).getLocks(clusterId, infobaseId,
                conn.getClusterUser(), conn.getClusterPasswordEncrypted());
    }

    @Transactional
    public void setSessionsDenied(Long connectionId, UUID clusterId, UUID infobaseId,
                                   boolean denied, String message, String code,
                                   String username, String ipAddress) {
        RasConnection conn = getConnectionOrThrow(connectionId);
        getClient(conn).setSessionsDenied(clusterId, infobaseId, denied, message, code,
                conn.getClusterUser(), conn.getClusterPasswordEncrypted());
        auditService.log(username, denied ? "BLOCK_SESSIONS" : "UNBLOCK_SESSIONS",
                "infobaseId=" + infobaseId, ipAddress, true, null);
    }

    public List<LicenseInfo> getLicenses(Long connectionId, UUID clusterId) {
        RasConnection conn = getConnectionOrThrow(connectionId);
        return getClient(conn).getLicenses(clusterId,
                conn.getClusterUser(), conn.getClusterPasswordEncrypted());
    }

    /** Проверяем доступность всех активных подключений каждые 60 секунд */
    @Scheduled(fixedDelayString = "PT60S")
    @Transactional
    public void healthCheck() {
        connectionRepository.findByEnabledTrueOrderByNameAsc().forEach(conn -> {
            try {
                getClient(conn).getClusters();
                conn.setStatus(ConnectionStatus.CONNECTED);
                conn.setLastError(null);
            } catch (Exception e) {
                conn.setStatus(ConnectionStatus.ERROR);
                conn.setLastError(e.getMessage());
                log.warn("RAS недоступен: {} — {}", conn.getName(), e.getMessage());
            }
            conn.setLastCheckedAt(LocalDateTime.now());
            connectionRepository.save(conn);
        });
    }

    @CacheEvict(value = {"clusters", "infobases"}, allEntries = true)
    public void evictCaches() {}

    private RasConnection getConnectionOrThrow(Long id) {
        return connectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Подключение не найдено: " + id));
    }

    private RasClient getClient(RasConnection conn) {
        return clientFactory.getClient(conn);
    }
}
