package ru.skala.ras.model;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LockInfo {
    private UUID sessionId;
    private String userName;
    private String lockSpace;
    private String lockObject;
    private String lockMode;    // "Shared", "Exclusive"
    private long lockedSince;  // мс с момента захвата
}
