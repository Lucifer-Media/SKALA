package ru.skala.ras;

import ru.skala.domain.RasConnection;

/**
 * Создаёт реальный IBIS-клиент только когда 1С JARs присутствуют в classpath.
 * Изолирован в отдельный класс чтобы не вызывать ClassNotFoundException при старте.
 */
class IbisRasClientFactory {

    static RasClient create(RasConnection connection) {
        return new IbisRasClient(connection.getHost(), connection.getPort());
    }
}
