/**
 * Перевод известных текстов ошибок бэкенда на язык приложения.
 * Бэкенд возвращает англоязычные message — здесь маппим их на ключи i18n.
 * Неизвестные ошибки сводим к общему "Что-то пошло не так".
 */

import i18n from "../i18n";

/** Точные message бэкенда → ключ в секции apiErrors локалей */
const ERROR_KEY_MAP: Record<string, string> = {
  "User with this phone number already exists": "phoneExists",
  "Phone number already exists": "phoneExists",
  "Email already exists": "emailExists",
  "Phone number or Email already exists": "phoneOrEmailExists",
  "Invalid email or password": "invalidCredentials",
  "Phone number not registered": "phoneNotRegistered",
  "Invalid or expired code": "invalidOrExpiredCode",
  "User not found": "userNotFound",
  "Chef not found": "chefNotFound",
  "Dish not found": "dishNotFound",
  "Password must be at least 6 characters": "passwordTooShort",
  "Current password is incorrect": "wrongCurrentPassword",
  "Username already taken": "usernameTaken",
  "Username must be 3-32 chars: a-z, 0-9, _": "usernameInvalid",
};

/** Достаёт message из axios-ошибки (string | string[] | undefined). */
const extractMessage = (error: any): string | null => {
  const raw =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message;
  if (Array.isArray(raw)) return raw.join("\n");
  return typeof raw === "string" ? raw : null;
};

/**
 * Возвращает локализованный текст ошибки.
 * Известные тексты бэка переводятся; кириллица показывается как есть;
 * всё остальное — общий фолбэк.
 */
export const translateApiError = (error: unknown): string => {
  const message = extractMessage(error);
  if (message) {
    const key = ERROR_KEY_MAP[message.trim()];
    if (key) return i18n.t(`apiErrors.${key}`);
    // Бэкенд уже прислал русский текст (например, ошибки отзывов) — показываем как есть
    if (/[а-яё]/i.test(message)) return message;
  }
  return i18n.t("apiErrors.generic");
};
