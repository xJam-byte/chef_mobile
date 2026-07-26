import axios from "axios";
import { API_BASE_URL } from "../constants";
import { getAccessToken, setAccessToken, removeAccessToken } from "../utils/storage";

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
 * 401 interceptor: try to refresh the token once, then retry the original request.
 * If refresh also fails → clear token (implicit logout on next auth check).
 */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 and only once per request
    if (error?.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh when the failing request IS the refresh call
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const token = await getAccessToken();
        if (!token) {
          // No token at all — nothing to refresh
          return Promise.reject(error);
        }

        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const newToken = data.token;
        await setAccessToken(newToken);
        apiClient.defaults.headers.Authorization = `Bearer ${newToken}`;
        onTokenRefreshed(newToken);
        isRefreshing = false;

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        // Refresh failed — clear token, user will be redirected to login
        await removeAccessToken();
        delete apiClient.defaults.headers.Authorization;
        return Promise.reject(refreshError);
      }
    }

    // Another request is already refreshing — queue this one
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken: string) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(apiClient(originalRequest));
      });
    });
  },
);
