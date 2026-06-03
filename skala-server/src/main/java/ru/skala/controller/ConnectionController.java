package ru.skala.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.skala.domain.RasConnection;
import ru.skala.service.RasConnectionService;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final RasConnectionService connectionService;

    @GetMapping
    public List<RasConnection> list() {
        return connectionService.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public RasConnection create(@Valid @RequestBody ConnectionRequest request) {
        RasConnection conn = RasConnection.builder()
                .name(request.getName())
                .host(request.getHost())
                .port(request.getPort())
                .clusterUser(request.getClusterUser())
                .description(request.getDescription())
                .enabled(true)
                .build();
        return connectionService.save(conn);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        connectionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    static class ConnectionRequest {
        @NotBlank private String name;
        @NotBlank private String host;
        @NotNull  private Integer port;
        private String clusterUser;
        private String description;
    }
}
