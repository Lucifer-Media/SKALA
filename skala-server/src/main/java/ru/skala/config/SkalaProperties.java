package ru.skala.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "skala")
public class SkalaProperties {

    private Jwt jwt = new Jwt();
    private Security security = new Security();
    private Ras ras = new Ras();

    @Data
    public static class Jwt {
        private String secret;
        private long expirationMs = 86400000L;
        private long refreshExpirationMs = 604800000L;
    }

    @Data
    public static class Security {
        private int maxLoginAttempts = 5;
        private int lockoutDurationMinutes = 15;
        private int sessionTimeoutMinutes = 60;
    }

    @Data
    public static class Ras {
        private int connectionTimeoutMs = 5000;
        private int readTimeoutMs = 30000;
        private int pollIntervalSeconds = 30;
    }
}
