/**
 * Cart Context - User-isolated persistent cart state management
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import type { CartItem, Dish } from "../types";
import { saveCart, loadCart } from "../storage";

interface CartContextType {
  items: CartItem[];
  addItem: (dish: Dish, quantity?: number, preferences?: string) => { success: boolean; alreadyExists: boolean };
  removeItem: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  updatePreferences: (dishId: number, preferences: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  userId: number | null; // User ID for cart isolation
}

export const CartProvider = ({ children, userId }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart when userId changes (login/logout/switch user)
  useEffect(() => {
    const loadUserCart = async () => {
      setIsLoading(true);
      
      if (userId) {
        // User logged in - load their cart
        console.log(`[Cart] Loading cart for user ${userId}`);
        const loadedItems = await loadCart(userId);
        setItems(loadedItems);
      } else {
        // User logged out - clear cart from memory (but keep in storage)
        console.log('[Cart] User logged out, clearing cart from memory');
        setItems([]);
      }
      
      setIsLoading(false);
    };

    loadUserCart();
  }, [userId]);

  // Save cart whenever items change (debounced auto-save)
  useEffect(() => {
    if (!isLoading && userId) {
      // Save cart to storage
      saveCart(userId, items);
    }
  }, [items, userId, isLoading]);

  const addItem = useCallback((dish: Dish, quantity: number = 1, preferences: string = ""): { success: boolean; alreadyExists: boolean } => {
    console.log("[Cart] Adding item:", dish.name, "x", quantity);
    
    // Check if item already exists in current state
    const existingIndex = items.findIndex((item) => item.dish.dish_id === dish.dish_id);
    
    if (existingIndex !== -1) {
      console.log("[Cart] Item already in cart, not adding");
      return { success: false, alreadyExists: true };
    }
    
    // Add new item
    console.log("[Cart] Adding new item");
    setItems((prev) => [...prev, { dish, quantity, preferences }]);
    return { success: true, alreadyExists: false };
  }, [items]);

  const removeItem = useCallback((dishId: number) => {
    console.log("[Cart] Removing item:", dishId);
    setItems((prev) => prev.filter((item) => item.dish.dish_id !== dishId));
  }, []);

  const updateQuantity = useCallback((dishId: number, quantity: number) => {
    console.log("[Cart] Updating quantity:", dishId, quantity);
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.dish.dish_id === dishId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const updatePreferences = useCallback((dishId: number, preferences: string) => {
    console.log("[Cart] Updating preferences:", dishId);
    setItems((prev) =>
      prev.map((item) =>
        item.dish.dish_id === dishId ? { ...item, preferences } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    console.log("[Cart] Clearing cart");
    setItems([]);
    // Storage will auto-clear via useEffect
  }, []);

  const totalPrice = items.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updatePreferences,
    clearCart,
    totalPrice,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

