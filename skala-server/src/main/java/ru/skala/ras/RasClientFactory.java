package ru.skala.ras;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import ru.skala.domain.RasConnection;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Создаёт и кэширует RasClient для каждого подключения.
 * При наличии 1С JARs в classpath создаёт IbisRasClient,
 * иначе — StubRasClient.
 */
@Slf4j
@Component
public class RasClientFactory {

    private static final boolean IBIS_AVAILABLE = isIbisPresent();
    private final Map<Long, RasClient> clientCache = new ConcurrentHashMap<>();

    public RasClient getClient(RasConnection connection) {
        return clientCache.computeIfAbsent(connection.getId(), id -> createClient(connection));
    }

    public void evictClient(Long connectionId) {
        RasClient client = clientCache.remove(connectionId);
        if (client != null) {
            try {
                client.disconnect();
            } catch (Exception e) {
                log.warn("Ошибка при закрытии RAS-клиента для id={}: {}", connectionId, e.getMessage());
            }
        }
    }

    private RasClient createClient(RasConnection connection) {
        if (IBIS_AVAILABLE) {
            try {
                return IbisRasClientFactory.create(connection);
            } catch (Exception e) {
                log.warn("Не удалось создать IBIS-клиент для {}, используется заглушка: {}",
                        connection.getName(), e.getMessage());
            }
        }
        log.info("Используется StubRasClient для подключения '{}'", connection.getName());
        return new StubRasClient();
    }

    private static boolean isIbisPresent() {
        try {
            Class.forName("com._1c.v8.ibis.admin.IAgentAdminConnection");
            return true;
        } catch (ClassNotFoundException e) {
            return false;
        }
    }
}
