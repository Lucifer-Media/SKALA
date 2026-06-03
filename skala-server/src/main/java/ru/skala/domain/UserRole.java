package ru.skala.domain;

public enum UserRole {
    VIEWER,       // Наблюдатель — только просмотр
    OPERATOR,     // Оператор — просмотр + управление базами
    ADMIN_1C,     // Администратор 1С — + завершение сеансов
    SUPERADMIN    // Суперадминистратор — полный доступ
}
