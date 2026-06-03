package ru.skala.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import ru.skala.service.AuthService;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final AuthService authService;

    @Override
    public void run(ApplicationArguments args) {
        // Создаём superadmin/admin при первом запуске если нет пользователей
        // В production пароль должен быть изменён через интерфейс после первого входа
        authService.createInitialAdmin("admin", "Admin123!");
        log.info("СКАЛА запущена. Веб-интерфейс: http://localhost:8090");
    }
}
