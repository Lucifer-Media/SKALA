package ru.skala.ras;

import ru.skala.ras.model.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Заглушка для разработки без реального RAS.
 * Активируется профилем "stub" или когда 1С API недоступен.
 */
public class StubRasClient implements RasClient {

    private static final UUID CLUSTER_ID = UUID.fromString("00000000-0000-0000-0001-000000000001");
    private static final UUID INFOBASE_ID = UUID.fromString("00000000-0000-0000-0002-000000000001");

    @Override
    public List<ClusterInfo> getClusters() {
        return List.of(
                ClusterInfo.builder()
                        .id(CLUSTER_ID)
                        .name("Тестовый кластер")
                        .host("localhost")
                        .port(1541)
                        .sessionCount(5)
                        .processCount(2)
                        .loadBalancingMode("performance")
                        .maxMemorySize(0)
                        .securityLevel(0)
                        .build()
        );
    }

    @Override
    public List<InfobaseInfo> getInfobases(UUID clusterId, String user, String password) {
        return List.of(
                InfobaseInfo.builder()
                        .id(INFOBASE_ID)
                        .name("demo_erp")
                        .description("Демо: ERP 2.5")
                        .dbms("PostgreSQL")
                        .dbServer("localhost")
                        .dbName("demo_erp")
                        .sessionsDenied(false)
                        .scheduledJobsDenied(false)
                        .sessionCount(3)
                        .locale("ru_RU")
                        .build(),
                InfobaseInfo.builder()
                        .id(UUID.randomUUID())
                        .name("demo_buh")
                        .description("Демо: Бухгалтерия 3.0")
                        .dbms("PostgreSQL")
                        .dbServer("localhost")
                        .dbName("demo_buh")
                        .sessionsDenied(false)
                        .scheduledJobsDenied(false)
                        .sessionCount(2)
                        .locale("ru_RU")
                        .build()
        );
    }

    @Override
    public List<SessionInfo> getSessions(UUID clusterId, UUID infobaseId, String user, String password) {
        return List.of(
                SessionInfo.builder()
                        .id(UUID.randomUUID())
                        .sessionNumber(1)
                        .userName("Иванов И.И.")
                        .userHost("PC-IVANOV")
                        .appId("1CV8")
                        .startedAt(LocalDateTime.now().minusHours(2))
                        .lastActiveAt(LocalDateTime.now().minusMinutes(5))
                        .memoryTotal(512_000_000L)
                        .memoryUsed(256_000_000L)
                        .cpuTimeCurrent(0L)
                        .cpuTimeTotal(12000L)
                        .durationCurrent(0L)
                        .durationAll(45000L)
                        .callCount(320)
                        .currentAction("Ожидание")
                        .infobaseId(infobaseId)
                        .blocksCount(0)
                        .build(),
                SessionInfo.builder()
                        .id(UUID.randomUUID())
                        .sessionNumber(2)
                        .userName("Петрова А.С.")
                        .userHost("PC-PETROVA")
                        .appId("WebClient")
                        .startedAt(LocalDateTime.now().minusMinutes(30))
                        .lastActiveAt(LocalDateTime.now().minusSeconds(30))
                        .memoryTotal(256_000_000L)
                        .memoryUsed(128_000_000L)
                        .cpuTimeCurrent(500L)
                        .cpuTimeTotal(8000L)
                        .durationCurrent(2500L)
                        .durationAll(31000L)
                        .callCount(150)
                        .currentAction("Выполнение запроса")
                        .infobaseId(infobaseId)
                        .blocksCount(2)
                        .build()
        );
    }

    @Override
    public void terminateSession(UUID clusterId, UUID sessionId, String user, String password) {
        // заглушка — ничего не делает
    }

    @Override
    public List<WorkingProcessInfo> getWorkingProcesses(UUID clusterId, String user, String password) {
        return List.of(
                WorkingProcessInfo.builder()
                        .id(UUID.randomUUID())
                        .host("localhost")
                        .port(1561)
                        .pid(12345)
                        .isEnable(true)
                        .runningSessionCount(3)
                        .callCount(470)
                        .avgCallTime(95L)
                        .memorySize(768_000_000L)
                        .build()
        );
    }

    @Override
    public List<LockInfo> getLocks(UUID clusterId, UUID infobaseId, String user, String password) {
        return List.of(
                LockInfo.builder()
                        .sessionId(UUID.randomUUID())
                        .userName("Петрова А.С.")
                        .lockSpace("AccumulationRegister.Товары")
                        .lockObject("Recorder=Документ.РеализацияТоваров.Ссылка")
                        .lockMode("Exclusive")
                        .lockedSince(2500L)
                        .build()
        );
    }

    @Override
    public void setSessionsDenied(UUID clusterId, UUID infobaseId, boolean denied,
                                   String message, String code, String user, String password) {
        // заглушка
    }

    @Override
    public void setScheduledJobsDenied(UUID clusterId, UUID infobaseId, boolean denied,
                                        String user, String password) {
        // заглушка
    }

    @Override
    public List<LicenseInfo> getLicenses(UUID clusterId, String user, String password) {
        return List.of(
                LicenseInfo.builder()
                        .series("000000")
                        .maxUsers(50)
                        .licenseType("Client")
                        .shortPresentation("1С:Предприятие 8. Клиентская лицензия на 50 р.м.")
                        .build()
        );
    }

    @Override
    public void disconnect() {
        // заглушка
    }
}
