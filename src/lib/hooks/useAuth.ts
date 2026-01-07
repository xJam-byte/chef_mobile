/**
 * Authentication React Query hooks + auth sync bus
 */

import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, register, logout } from "../api";
import { clearAllStorage, getAccessToken } from "../utils/storage";
import { QUERY_KEYS } from "../constants";
import type { LoginDto, RegisterDto } from "../types";

/**
 * Tiny auth event bus (чтобы RootNavigator не поллил токен каждые 4 сек)
 */
type Listener = () => void;
const listeners = new Set<Listener>();

export const notifyAuthChanged = () => {
  listeners.forEach((fn) => fn());
};

export const subscribeAuthChanged = (fn: Listener) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/**
 * Hook: single source of truth for "isAuthenticated"
 */
export const useAuthStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refresh = async () => {
    try {
      const token = await getAccessToken();
      setIsAuthenticated(!!token);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    const unsub = subscribeAuthChanged(() => {
      // при логине/логауте
      refresh();
    });

    // если приложение вернулось на экран — обновим auth
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") refresh();
    });

    return () => {
      unsub();
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(
    () => ({ isLoading, isAuthenticated, refresh }),
    [isLoading, isAuthenticated]
  );
};

/**
 * Login mutation
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: LoginDto) => login(dto),
    onSuccess: async () => {
      // сбросим профиль/заказы чтобы подтянулись с новым токеном
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE as any });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS as any });

      notifyAuthChanged();
    },
  });
};

/**
 * Register mutation
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: RegisterDto) => register(dto),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE as any });
      notifyAuthChanged();
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.clear();
      await clearAllStorage();
      notifyAuthChanged();
    },
  });
};
