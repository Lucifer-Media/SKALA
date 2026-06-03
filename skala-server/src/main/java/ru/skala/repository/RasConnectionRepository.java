package ru.skala.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.skala.domain.RasConnection;

import java.util.List;

public interface RasConnectionRepository extends JpaRepository<RasConnection, Long> {
    List<RasConnection> findByEnabledTrueOrderByNameAsc();
}
