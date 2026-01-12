import * as SecureStore from "expo-secure-store";
import type { User } from "../types";

/**
 * IMPORTANT:
 * Expo Go (SDK 54) always runs with New Architecture.
 * If AsyncStorage TurboModule is missing/mismatched, static import may crash the app on startup.
 * Поэтому грузим AsyncStorage лениво и безопасно.
 */

const ACCESS_TOKEN_KEY = "auth:access_token";
const USER_PROFILE_KEY = "user:profile";
const THEME_KEY = "app:theme";

let cachedToken: string | null | undefined = undefined; // undefined = ещё не грузили
const listeners = new Set<(token: string | null) => void>();

function emit(token: string | null) {
  for (const cb of listeners) cb(token);
}

export function subscribeAccessToken(cb: (token: string | null) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Lazy AsyncStorage loader (won't crash app on import) */
type AsyncStorageType = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};
let _asyncStorage: AsyncStorageType | null | undefined = undefined; // undefined=не пробовали, null=нет, obj=есть

async function getAsyncStorage(): Promise<AsyncStorageType | null> {
  if (_asyncStorage !== undefined) return _asyncStorage;

  try {
    const mod: any = await import("@react-native-async-storage/async-storage");
    _asyncStorage = mod?.default ?? null;
    return _asyncStorage as AsyncStorageType | null;
  } catch {
    _asyncStorage = null;
    return null;
  }
}

async function secureGet(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSet(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {}
}

async function secureDel(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
}

export async function getAccessToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;

  // 1) SecureStore
  const secure = await secureGet(ACCESS_TOKEN_KEY);
  if (secure) {
    cachedToken = secure;
    return secure;
  }

  // 2) AsyncStorage fallback (if available)
  const AS = await getAsyncStorage();
  if (AS) {
    try {
      const plain = await AS.getItem(ACCESS_TOKEN_KEY);
      cachedToken = plain || null;
      return cachedToken;
    } catch {
      cachedToken = null;
      return null;
    }
  }

  cachedToken = null;
  return null;
}

export async function setAccessToken(token: string) {
  cachedToken = token;

  await secureSet(ACCESS_TOKEN_KEY, token);

  const AS = await getAsyncStorage();
  if (AS) {
    try {
      await AS.setItem(ACCESS_TOKEN_KEY, token);
    } catch {}
  }

  emit(token);
}

export async function removeAccessToken() {
  cachedToken = null;

  await secureDel(ACCESS_TOKEN_KEY);

  const AS = await getAsyncStorage();
  if (AS) {
    try {
      await AS.removeItem(ACCESS_TOKEN_KEY);
    } catch {}
  }

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
  // Prefer AsyncStorage if available, otherwise SecureStore fallback
  const AS = await getAsyncStorage();

  if (AS) {
    try {
      const data = await AS.getItem(USER_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  const secure = await secureGet(USER_PROFILE_KEY);
  try {
    return secure ? (JSON.parse(secure) as User) : null;
  } catch {
    return null;
  }
}

/**
 * Save user profile to storage
 */
export async function setUserProfile(user: User): Promise<void> {
  const payload = JSON.stringify(user);

  const AS = await getAsyncStorage();
  if (AS) {
    try {
      await AS.setItem(USER_PROFILE_KEY, payload);
      return;
    } catch {}
  }

  // fallback
  await secureSet(USER_PROFILE_KEY, payload);
}

/**
 * Get theme preference from storage
 */
export async function getThemePreference(): Promise<"light" | "dark" | null> {
  const AS = await getAsyncStorage();
  if (AS) {
    try {
      const theme = await AS.getItem(THEME_KEY);
      return (theme as "light" | "dark" | null) ?? null;
    } catch {
      // continue
    }
  }

  const secure = await secureGet(THEME_KEY);
  if (secure === "light" || secure === "dark") return secure;
  return null;
}

/**
 * Save theme preference to storage
 */
export async function setThemePreference(theme: "light" | "dark"): Promise<void> {
  const AS = await getAsyncStorage();
  if (AS) {
    try {
      await AS.setItem(THEME_KEY, theme);
      return;
    } catch {}
  }

  await secureSet(THEME_KEY, theme);
}
