-- Пользователи СКАЛА
CREATE TABLE app_users (
    id                    BIGSERIAL PRIMARY KEY,
    username              VARCHAR(100)  NOT NULL UNIQUE,
    password_hash         VARCHAR(255)  NOT NULL,
    display_name          VARCHAR(200),
    email                 VARCHAR(200),
    role                  VARCHAR(50)   NOT NULL DEFAULT 'VIEWER',
    enabled               BOOLEAN       NOT NULL DEFAULT TRUE,
    locked                BOOLEAN       NOT NULL DEFAULT FALSE,
    failed_login_attempts INT           NOT NULL DEFAULT 0,
    lockout_until         TIMESTAMP,
    last_login_at         TIMESTAMP,
    created_at            TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- RAS-подключения
CREATE TABLE ras_connections (
    id                         BIGSERIAL PRIMARY KEY,
    name                       VARCHAR(200)  NOT NULL,
    host                       VARCHAR(255)  NOT NULL,
    port                       INT           NOT NULL DEFAULT 1545,
    cluster_user               VARCHAR(100),
    cluster_password_encrypted VARCHAR(500),
    enabled                    BOOLEAN       NOT NULL DEFAULT TRUE,
    description                VARCHAR(500),
    status                     VARCHAR(50)   NOT NULL DEFAULT 'UNKNOWN',
    last_checked_at            TIMESTAMP,
    last_error                 VARCHAR(500),
    created_at                 TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMP     NOT NULL DEFAULT NOW(),
    created_by                 BIGINT REFERENCES app_users(id)
);

-- Аудит-лог
CREATE TABLE audit_log (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(100)  NOT NULL,
    action        VARCHAR(100)  NOT NULL,
    details       VARCHAR(1000),
    ip_address    VARCHAR(45),
    success       BOOLEAN       NOT NULL DEFAULT TRUE,
    error_message VARCHAR(500),
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_username   ON audit_log (username);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at DESC);
CREATE INDEX idx_audit_log_action     ON audit_log (action);
