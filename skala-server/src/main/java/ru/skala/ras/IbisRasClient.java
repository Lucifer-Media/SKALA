package ru.skala.ras;

import lombok.extern.slf4j.Slf4j;
import ru.skala.ras.model.*;

import java.util.List;
import java.util.UUID;

/**
 * Реализация через com._1c.v8.ibis.admin (Java API 1С).
 * Требует наличия JAR-файлов 1С в classpath (папка lib/).
 *
 * Подключение к 1С JARs:
 *   1. Скачать архив с its.1c.ru (требуется ИТС)
 *   2. Положить JARs в skala-server/lib/
 *   3. Установить в локальный Maven-репозиторий:
 *      mvn install:install-file -Dfile=lib/com._1c.v8.ibis.admin-1.6.7.jar \
 *        -DgroupId=com._1c.v8 -DartifactId=ibis.admin -Dversion=1.6.7 -Dpackaging=jar
 *   4. Раскомментировать зависимости в pom.xml
 */
@Slf4j
public class IbisRasClient implements RasClient {

    private final String host;
    private final int port;

    // Поля подключения через IBIS API:
    // private IAgentAdminConnection agentConnection;

    IbisRasClient(String host, int port) {
        this.host = host;
        this.port = port;
        connect();
    }

    private void connect() {
        /*
         * Пример реального подключения через IBIS API:
         *
         * IAdminFactory factory = AdminFactory.instance();
         * agentConnection = factory.createAgentConnection(host, port);
         *
         * В текущей реализации API вызывается через агентское соединение:
         * List<IClusterInfo> clusters = agentConnection.getClusters();
         */
        log.info("Подключение к RAS {}:{} (IBIS API)", host, port);
    }

    @Override
    public List<ClusterInfo> getClusters() {
        /*
         * IAdminFactory factory = AdminFactory.instance();
         * IAgentAdminConnection conn = factory.createAgentConnection(host, port);
         * List<IClusterInfo> clusters = conn.getClusters();
         * return clusters.stream().map(this::mapCluster).toList();
         */
        throw new UnsupportedOperationException(
                "1С JARs не подключены. Добавьте com._1c.v8.ibis.admin в classpath.");
    }

    @Override
    public List<InfobaseInfo> getInfobases(UUID clusterId, String user, String password) {
        throw new UnsupportedOperationException("1С JARs не подключены.");
    }

    @Override
    public List<SessionInfo> getSessions(UUID clusterId, UUID infobaseId, String user, String password) {
        throw new UnsupportedOperationException("1С JARs не подключены.");
    }

    @Override
    public void terminateSession(UUID clusterId, UUID sessionId, String user, String password) {
        throw new UnsupportedOperationException("1С JARs не подключены.");
    }

    @Override
    public List<WorkingProcessInfo> getWorkingProcesses(UUID clusterId, String user, String password) {
        throw new UnsupportedOperationException("1С JARs не подключены.");
    }

    @Override
    public List<LockInfo> getLocks(UUID clusterId, UUID infobaseId, String user, String password) {
        throw new UnsupportedOperationException("1С JARs не подключены.");
    }

    @Override
    public void setSessionsDenied(UUID clusterId, UUID infobaseId, boolean denied,
                                   String message, String code, String user, String password) {
        throw new UnsupportedOperationException("1С JARs не подключены.");
    }

    @Override
    public void setScheduledJobsDenied(UUID clusterId, UUID infobaseId, boolean denied,
                                        String user, String password) {
        throw new UnsupportedOperationException("1С JARs не подключены.");
    }

    @Override
    public List<LicenseInfo> getLicenses(UUID clusterId, String user, String password) {
        throw new UnsupportedOperationException("1С JARs не подключены.");
    }

    @Override
    public void disconnect() {
        // agentConnection.close();
        log.info("RAS-соединение закрыто: {}:{}", host, port);
    }
}
