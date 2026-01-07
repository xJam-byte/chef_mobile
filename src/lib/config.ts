/**
 * Configuration from environment variables
 * With dynamic host detection for Expo Go
 */
import Constants from "expo-constants";

const getApiUrl = () => {
  // 1. Если задан явно через .env, используем его
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }

  // 2. Для Expo Go на реальном устройстве или эмуляторе:
  // Получаем IP хоста (компьютера) динамически из манифеста Expo
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}:5000`;
  }

  // 3. Fallback для веба или если что-то пошло не так
  return "http://localhost:5000";
};

export const API_BASE_URL = getApiUrl();
