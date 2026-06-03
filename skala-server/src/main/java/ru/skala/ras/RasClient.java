package ru.skala.ras;

import ru.skala.ras.model.*;

import java.util.List;
import java.util.UUID;

/**
 * Контракт для работы с RAS 1С:Предприятие 8.
 * Реализация через com._1c.v8.ibis.admin подключается через IbisRasClient.
 * Заглушка для тестирования — StubRasClient.
 */
public interface RasClient {

    /**
     * Проверить доступность RAS и получить список кластеров.
     */
    List<ClusterInfo> getClusters();

    /**
     * Список информационных баз кластера.
     */
    List<InfobaseInfo> getInfobases(UUID clusterId, String clusterUser, String clusterPassword);

    /**
     * Список активных сеансов в базе.
     */
    List<SessionInfo> getSessions(UUID clusterId, UUID infobaseId,
                                  String clusterUser, String clusterPassword);

    /**
     * Принудительно завершить сеанс.
     */
    void terminateSession(UUID clusterId, UUID sessionId,
                          String clusterUser, String clusterPassword);

    /**
     * Список рабочих процессов кластера.
     */
    List<WorkingProcessInfo> getWorkingProcesses(UUID clusterId,
                                                  String clusterUser, String clusterPassword);

    /**
     * Список блокировок информационной базы.
     */
    List<LockInfo> getLocks(UUID clusterId, UUID infobaseId,
                            String clusterUser, String clusterPassword);

    /**
     * Блокировка/разблокировка сеансов информационной базы.
     */
    void setSessionsDenied(UUID clusterId, UUID infobaseId, boolean denied,
                           String deniedMessage, String permissionCode,
                           String clusterUser, String clusterPassword);

    /**
     * Блокировка/разблокировка регламентных заданий информационной базы.
     */
    void setScheduledJobsDenied(UUID clusterId, UUID infobaseId, boolean denied,
                                String clusterUser, String clusterPassword);

    /**
     * Статистика лицензий кластера.
     */
    List<LicenseInfo> getLicenses(UUID clusterId, String clusterUser, String clusterPassword);

    /**
     * Закрыть соединение с RAS.
     */
    void disconnect();
}
