package ru.skala.ras.model;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SessionInfo {
    private UUID id;
    private int sessionNumber;
    private String userName;
    private String userHost;
    private String appId;         // "1CV8", "1CV8C", "WebClient", "Designer", etc.
    private LocalDateTime startedAt;
    private LocalDateTime lastActiveAt;
    private long memoryTotal;
    private long memoryUsed;
    private long cpuTimeCurrent;
    private long cpuTimeTotal;
    private long dbmsBytesAll;
    private int callCount;
    private long durationCurrent;  // мс
    private long durationAll;      // мс
    private String currentAction;
    private UUID workingProcessId;
    private UUID infobaseId;
    private int blocksCount;
}
