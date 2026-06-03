package ru.skala.ras.model;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ClusterInfo {
    private UUID id;
    private String name;
    private String host;
    private int port;
    private int sessionCount;
    private int processCount;
    private String loadBalancingMode;
    private int maxMemorySize;
    private int maxMemoryTimeLimit;
    private int securityLevel;
    private int sessionFaultToleranceLevel;
}
