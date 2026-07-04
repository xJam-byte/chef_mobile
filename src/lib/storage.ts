/**
 * AsyncStorage utilities for persistent cart storage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CartItem } from "./types";

const CART_KEY_PREFIX = "@chef_cart_";

export interface StoredCart {
  items: CartItem[];
  timestamp: number;
  userId: number;
}

/**
 * Generate user-specific cart storage key
 */
export const getCartKey = (userId: number): string => {
  return `${CART_KEY_PREFIX}${userId}`;
};

/**
 * Save cart to AsyncStorage for specific user
 */
export const saveCart = async (
  userId: number,
  items: CartItem[],
): Promise<void> => {
  try {
    const cartData: StoredCart = {
      items,
      timestamp: Date.now(),
      userId,
    };
    const key = getCartKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(cartData));
  } catch (error) {
    console.error("[Storage] Error saving cart:", error);
  }
};

/**
 * Load cart from AsyncStorage for specific user
 */
export const loadCart = async (userId: number): Promise<CartItem[]> => {
  try {
    const key = getCartKey(userId);
    const data = await AsyncStorage.getItem(key);

    if (!data) {
      return [];
    }

    const cartData: StoredCart = JSON.parse(data);

    // Verify the cart belongs to the correct user
    if (cartData.userId !== userId) {
      return [];
    }

    // console.log(`[Storage] Cart loaded for user ${userId}:`, cartData.items);
    return cartData.items;
  } catch (error) {
    console.error("[Storage] Error loading cart:", error);
    return [];
  }
};

/**
 * Clear cart from AsyncStorage for specific user
 */
export const clearStoredCart = async (userId: number): Promise<void> => {
  try {
    const key = getCartKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("[Storage] Error clearing cart:", error);
  }
};

/**
 * Clear all carts from AsyncStorage (for debugging)
 */
export const clearAllCarts = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cartKeys = keys.filter((key) => key.startsWith(CART_KEY_PREFIX));
    await AsyncStorage.multiRemove(cartKeys);
  } catch (error) {
    console.error("[Storage] Error clearing all carts:", error);
  }
};
