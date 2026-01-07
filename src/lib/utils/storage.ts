import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants";

export async function setAccessToken(token: string) {
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
}

export async function removeAccessToken() {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  } catch {}
}

export async function setUserProfile(profile: any) {
  await AsyncStorage.setItem(
    STORAGE_KEYS.USER_PROFILE,
    JSON.stringify(profile)
  );
}

export async function getUserProfile() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearAllStorage() {
  await removeAccessToken();
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
}
