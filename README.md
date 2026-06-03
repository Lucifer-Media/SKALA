# СКАЛА — Система контроля администрирования 1С

Веб-интерфейс для мониторинга и управления серверами 1С:Предприятие через протокол RAS (Remote Administration Service).

## Возможности

- Просмотр кластеров, рабочих процессов и информационных баз
- Мониторинг сессий и активных соединений
- Управление блокировками
- JWT-аутентификация с поддержкой ролей (Admin / Viewer)
- Журнал аудита всех действий
- Поддержка нескольких RAS-соединений

## Стек технологий

| Компонент | Технологии |
|-----------|-----------|
| Бэкенд | Java 17, Spring Boot 3.2, Spring Security, Flyway |
| База данных | PostgreSQL 16 |
| Фронтенд | React 18, TypeScript, Ant Design 5, Vite |
| Деплой | Docker Compose / systemd |

---

## Быстрый старт через Docker Compose

**Требования:** Docker 24+, Docker Compose v2

```bash
# 1. Клонировать репозиторий
git clone https://github.com/Lucifer-Media/SKALA.git
cd SKALA

# 2. Задать секреты (или оставить значения по умолчанию для теста)
export DB_PASSWORD=skala_secret
export JWT_SECRET=change-this-secret-min-32-characters!

# 3. Собрать образ бэкенда
docker build -t skala-server:latest ./skala-server

# 4. Запустить
docker compose up -d

# 5. Открыть в браузере
# http://localhost:8090
```

Учётные данные по умолчанию: **admin / Admin123!**

> Смените пароль после первого входа.

---

## Установка на сервер (Ubuntu / Astra Linux)

**Требования:** Ubuntu 20.04/22.04/24.04 или Astra Linux 1.7/1.8, Java 17, PostgreSQL 14+

### 1. Сборка JAR

```bash
cd skala-server
./mvnw clean package -DskipTests
# Файл: target/skala-server-1.0.0-SNAPSHOT.jar
```

### 2. Запуск установочного скрипта

```bash
# Скопировать JAR и deploy/ на сервер
scp target/skala-server-1.0.0-SNAPSHOT.jar user@server:/tmp/
scp -r deploy/ user@server:/tmp/deploy/

# На сервере
cd /tmp
sudo SKALA_VERSION=1.0.0-SNAPSHOT bash deploy/install.sh
```

Скрипт автоматически:
- Установит зависимости (Java, PostgreSQL)
- Создаст системного пользователя `skala`
- Настроит базу данных с генерацией случайного пароля
- Зарегистрирует systemd-сервис

### 3. Запуск сервиса

```bash
sudo systemctl start skala
sudo systemctl status skala

# Логи в реальном времени
journalctl -u skala -f
```

Веб-интерфейс доступен на порту **8090**.

---

## Сборка фронтенда

```bash
cd skala-ui
npm install
npm run build        # собранные файлы в dist/
npm run dev          # режим разработки на http://localhost:5173
```

---

## Конфигурация

Переменные окружения (файл `/etc/skala/skala.env` или `.env` рядом с JAR):

| Переменная | По умолчанию | Описание |
|-----------|-------------|---------|
| `DB_HOST` | `localhost` | Хост PostgreSQL |
| `DB_PORT` | `5432` | Порт PostgreSQL |
| `DB_NAME` | `skala` | Имя базы данных |
| `DB_USER` | `skala` | Пользователь БД |
| `DB_PASSWORD` | `skala` | Пароль БД |
| `JWT_SECRET` | *(change-me)* | Секрет для подписи JWT (мин. 32 символа) |
| `LOG_DIR` | `/var/log/skala` | Директория логов |

API документация (Swagger UI): `http://localhost:8090/api/swagger-ui`

---

## Структура проекта

```
SKALA/
├── skala-server/          # Spring Boot бэкенд
│   ├── src/main/java/ru/skala/
│   │   ├── controller/    # REST API
│   │   ├── service/       # Бизнес-логика
│   │   ├── domain/        # JPA-сущности
│   │   ├── ras/           # Клиент RAS 1С
│   │   └── security/      # JWT-аутентификация
│   └── src/main/resources/
│       └── db/migration/  # Flyway-миграции
├── skala-ui/              # React фронтенд
│   └── src/
│       ├── pages/         # Страницы (Dashboard, Sessions, и др.)
│       ├── api/           # HTTP-клиент
│       └── store/         # Zustand-стор (auth)
├── deploy/                # Скрипт установки и systemd-юнит
└── docker-compose.yml
```

---

## Лицензия

Proprietary — все права защищены.
