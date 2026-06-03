package ru.skala.ras.model;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class InfobaseInfo {
    private UUID id;
    private String name;
    private String description;
    private String dbms;
    private String dbServer;
    private String dbName;
    private boolean sessionsDenied;
    private String sessionsDeniedMessage;
    private String sessionsDeniedPermissionCode;
    private boolean scheduledJobsDenied;
    private int sessionCount;
    private String locale;
}
