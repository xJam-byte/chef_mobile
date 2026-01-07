import axios from "axios";
import { API_BASE_URL } from "../constants";
import { getAccessToken } from "../utils/storage";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * ❗ ВАЖНО:
 * ❌ НЕ чистим токен автоматически на 401
 * Logout должен быть ТОЛЬКО явный
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
