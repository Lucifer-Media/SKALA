package ru.skala.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.skala.ras.model.*;
import ru.skala.service.RasConnectionService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/connections/{connectionId}")
@RequiredArgsConstructor
public class ClusterController {

    private final RasConnectionService rasService;

    @GetMapping("/clusters")
    public List<ClusterInfo> clusters(@PathVariable Long connectionId) {
        return rasService.getClusters(connectionId);
    }

    @GetMapping("/clusters/{clusterId}/infobases")
    public List<InfobaseInfo> infobases(
            @PathVariable Long connectionId,
            @PathVariable UUID clusterId) {
        return rasService.getInfobases(connectionId, clusterId);
    }

    @GetMapping("/clusters/{clusterId}/infobases/{infobaseId}/sessions")
    public List<SessionInfo> sessions(
            @PathVariable Long connectionId,
            @PathVariable UUID clusterId,
            @PathVariable UUID infobaseId) {
        return rasService.getSessions(connectionId, clusterId, infobaseId);
    }

    @DeleteMapping("/clusters/{clusterId}/sessions/{sessionId}")
    @PreAuthorize("hasAnyRole('ADMIN_1C', 'SUPERADMIN')")
    public void terminateSession(
            @PathVariable Long connectionId,
            @PathVariable UUID clusterId,
            @PathVariable UUID sessionId,
            @AuthenticationPrincipal UserDetails user,
            HttpServletRequest request) {
        rasService.terminateSession(connectionId, clusterId, sessionId,
                user.getUsername(), extractIp(request));
    }

    @GetMapping("/clusters/{clusterId}/processes")
    public List<WorkingProcessInfo> processes(
            @PathVariable Long connectionId,
            @PathVariable UUID clusterId) {
        return rasService.getWorkingProcesses(connectionId, clusterId);
    }

    @GetMapping("/clusters/{clusterId}/infobases/{infobaseId}/locks")
    public List<LockInfo> locks(
            @PathVariable Long connectionId,
            @PathVariable UUID clusterId,
            @PathVariable UUID infobaseId) {
        return rasService.getLocks(connectionId, clusterId, infobaseId);
    }

    @PostMapping("/clusters/{clusterId}/infobases/{infobaseId}/sessions-lock")
    @PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN_1C', 'SUPERADMIN')")
    public void setSessionsDenied(
            @PathVariable Long connectionId,
            @PathVariable UUID clusterId,
            @PathVariable UUID infobaseId,
            @RequestBody SessionsDenyRequest req,
            @AuthenticationPrincipal UserDetails user,
            HttpServletRequest request) {
        rasService.setSessionsDenied(connectionId, clusterId, infobaseId,
                req.isDenied(), req.getMessage(), req.getPermissionCode(),
                user.getUsername(), extractIp(request));
    }

    @GetMapping("/clusters/{clusterId}/licenses")
    public List<LicenseInfo> licenses(
            @PathVariable Long connectionId,
            @PathVariable UUID clusterId) {
        return rasService.getLicenses(connectionId, clusterId);
    }

    private String extractIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return (forwarded != null) ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
    }

    @Data
    static class SessionsDenyRequest {
        private boolean denied;
        private String message;
        private String permissionCode;
    }
}
