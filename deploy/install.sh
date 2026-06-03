#!/bin/sh
# install.sh — Установка СКАЛА на Ubuntu 20.04/22.04/24.04 и Astra Linux 1.7/1.8
# Запуск: sudo bash install.sh
set -eu

SKALA_VERSION="${SKALA_VERSION:-1.0.0}"
INSTALL_DIR="/opt/skala"
LOG_DIR="/var/log/skala"
CONFIG_DIR="/etc/skala"
SKALA_USER="skala"
WEB_PORT="8090"
DB_NAME="skala"
DB_USER="skala"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { printf "${GREEN}[INFO]${NC} %s\n" "$1"; }
warn()    { printf "${YELLOW}[WARN]${NC} %s\n" "$1"; }
error()   { printf "${RED}[ERROR]${NC} %s\n" "$1"; exit 1; }

# --- Проверки ---
[ "$(id -u)" -eq 0 ] || error "Запустите скрипт от root или через sudo"

# Определяем ОС и оболочку
OS_ID=$(. /etc/os-release && echo "$ID")
OS_VER=$(. /etc/os-release && echo "$VERSION_ID")
info "Обнаружена ОС: $OS_ID $OS_VER"

# Astra Linux использует zsh, записываем env туда и в /etc/environment
IS_ASTRA=0
if [ "$OS_ID" = "astra" ] || grep -qi "astra" /etc/os-release 2>/dev/null; then
  IS_ASTRA=1
  info "Режим Astra Linux — переменные окружения будут записаны в /etc/zsh/zshenv"
fi

# --- Зависимости ---
info "Обновление пакетов..."
apt-get update -q

info "Установка зависимостей..."
apt-get install -y -q curl wget postgresql postgresql-client

# Java — Axiom JDK 17 на Astra, Temurin на Ubuntu
if ! command -v java >/dev/null 2>&1; then
  if [ "$IS_ASTRA" -eq 1 ]; then
    info "Установка OpenJDK 17 из репозитория Astra Linux..."
    apt-get install -y -q openjdk-17-jre-headless || \
      warn "openjdk-17 не найден, попробуйте установить Axiom JDK 17 вручную с axiomjdk.ru"
  else
    info "Установка Eclipse Temurin 17..."
    wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | \
      gpg --dearmor -o /usr/share/keyrings/adoptium.gpg
    echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] \
      https://packages.adoptium.net/artifactory/deb $(. /etc/os-release && echo "$UBUNTU_CODENAME") main" \
      > /etc/apt/sources.list.d/adoptium.list
    apt-get update -q && apt-get install -y -q temurin-17-jre
  fi
fi

JAVA_VER=$(java -version 2>&1 | head -1)
info "Java: $JAVA_VER"

# --- Пользователь и директории ---
if ! id "$SKALA_USER" >/dev/null 2>&1; then
  info "Создание системного пользователя $SKALA_USER..."
  useradd -r -s /usr/sbin/nologin -d "$INSTALL_DIR" -c "СКАЛА сервис" "$SKALA_USER"
fi

install -d -o "$SKALA_USER" -g "$SKALA_USER" -m 755 "$INSTALL_DIR"
install -d -o "$SKALA_USER" -g "$SKALA_USER" -m 750 "$LOG_DIR"
install -d -o root -g root -m 755 "$CONFIG_DIR"

# --- PostgreSQL ---
info "Настройка PostgreSQL..."
DB_PASSWORD=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 24)

su -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'\" | grep -q 1 || \
  psql -c \"CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}'\"" postgres

su -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'\" | grep -q 1 || \
  psql -c \"CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}\"" postgres

# --- JWT secret ---
JWT_SECRET=$(tr -dc 'A-Za-z0-9!@#$%' < /dev/urandom | head -c 48)

# --- Файл переменных окружения ---
info "Создание конфигурации /etc/skala/skala.env..."
cat > "$CONFIG_DIR/skala.env" << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
LOG_DIR=${LOG_DIR}
EOF
chmod 600 "$CONFIG_DIR/skala.env"
chown root:root "$CONFIG_DIR/skala.env"

# На Astra Linux также пишем в /etc/zsh/zshenv для интерактивных сессий
if [ "$IS_ASTRA" -eq 1 ] && [ -f /etc/zsh/zshenv ]; then
  info "Запись JAVA_HOME в /etc/zsh/zshenv..."
  JAVA_HOME_PATH=$(dirname "$(dirname "$(readlink -f "$(which java)")")")
  grep -q "JAVA_HOME" /etc/zsh/zshenv || \
    echo "export JAVA_HOME=${JAVA_HOME_PATH}" >> /etc/zsh/zshenv
fi

# --- Копирование JAR ---
if [ -f "./skala-server-${SKALA_VERSION}.jar" ]; then
  info "Копирование JAR..."
  cp "./skala-server-${SKALA_VERSION}.jar" "$INSTALL_DIR/skala-server.jar"
  chown "$SKALA_USER:$SKALA_USER" "$INSTALL_DIR/skala-server.jar"
else
  warn "JAR-файл не найден — скопируйте skala-server.jar в $INSTALL_DIR вручную"
fi

# --- Systemd-сервис ---
info "Установка systemd-сервиса..."
cp "$(dirname "$0")/skala.service" /etc/systemd/system/skala.service
systemctl daemon-reload
systemctl enable skala

# --- Firewall (только Ubuntu) ---
if [ "$IS_ASTRA" -eq 0 ] && command -v ufw >/dev/null 2>&1; then
  info "Открытие порта $WEB_PORT в ufw..."
  ufw allow "$WEB_PORT/tcp" comment "СКАЛА веб-интерфейс" || true
fi

# --- Итог ---
echo ""
info "========================================"
info "Установка СКАЛА завершена"
info "========================================"
info "Конфигурация:   $CONFIG_DIR/skala.env"
info "Логи:           $LOG_DIR"
info "Веб-интерфейс:  http://$(hostname -I | awk '{print $1}'):$WEB_PORT"
info ""
info "Для запуска:    systemctl start skala"
info "Статус:         systemctl status skala"
info "Журнал:         journalctl -u skala -f"
info ""
warn "ВАЖНО: Смените пароль по умолчанию (admin/Admin123!) после первого входа!"
if [ "$IS_ASTRA" -eq 1 ]; then
  warn "Astra Linux: если сервис не запускается из-за Parsec — проверьте мандатные метки"
  warn "Astra Linux: если astra-bash-lock блокирует Java, добавьте исключение: astra-bash-lock add java"
fi
echo ""
