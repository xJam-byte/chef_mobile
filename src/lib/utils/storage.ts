import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { User } from "../types";

const ACCESS_TOKEN_KEY = "auth:access_token";
const USER_PROFILE_KEY = "user:profile";

let cachedToken: string | null | undefined = undefined; // undefined = ещё не грузили
const listeners = new Set<(token: string | null) => void>();

function emit(token: string | null) {
  for (const cb of listeners) cb(token);
}

export function subscribeAccessToken(cb: (token: string | null) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function getAccessToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;

  // 1) SecureStore
  try {
    const secure = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (secure) {
      cachedToken = secure;
      return secure;
    }
  } catch { }

  // 2) AsyncStorage fallback
  try {
    const plain = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    cachedToken = plain || null;
    return cachedToken;
  } catch {
    cachedToken = null;
    return null;
  }
}

export async function setAccessToken(token: string) {
  cachedToken = token;

  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  } catch { }

  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch { }

  emit(token);
}

export async function removeAccessToken() {
  cachedToken = null;

  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch { }

  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch { }

  emit(null);
}

// Полезно дернуть при старте (не обязательно)
export async function hydrateAccessToken() {
  await getAccessToken();
}

/**
 * Get user profile from storage
 */
export async function getUserProfile(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Save user profile to storage
 */
export async function setUserProfile(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save user profile:", error);
  }
}

/**
 * Get theme preference from storage
 */
export async function getThemePreference(): Promise<"light" | "dark" | null> {
  try {
    const theme = await AsyncStorage.getItem("app:theme");
    return theme as "light" | "dark" | null;
  } catch {
    return null;
  }
}

/**
 * Save theme preference to storage
 */
export async function setThemePreference(theme: "light" | "dark"): Promise<void> {
  try {
    await AsyncStorage.setItem("app:theme", theme);
  } catch (error) {
    console.error("Failed to save theme preference:", error);
  }
}
