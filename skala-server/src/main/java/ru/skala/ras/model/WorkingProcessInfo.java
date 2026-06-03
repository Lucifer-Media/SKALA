package ru.skala.ras.model;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class WorkingProcessInfo {
    private UUID id;
    private String host;
    private int port;
    private int pid;
    private boolean isEnable;
    private int runningSessionCount;
    private int callCount;
    private long avgCallTime;    // мс
    private long memorySize;     // байт
    private long memoryExcessTime;
    private long dbProcTook;
    private long dbProcInfo;
    private String version;
    private String clusterHostName;
}
