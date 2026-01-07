/**
 * Cart Context for global cart state management
 */

import React, { createContext, useState, useCallback, ReactNode } from "react";
import type { CartItem, Dish } from "../lib/types";

interface CartContextType {
    items: CartItem[];
    addItem: (dish: Dish, quantity?: number, preferences?: string) => void;
    removeItem: (dishId: number) => void;
    updateQuantity: (dishId: number, quantity: number) => void;
    updatePreferences: (dishId: number, preferences: string) => void;
    clearCart: () => void;
    totalPrice: number;
    totalItems: number;
}

export const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = useCallback(
        (dish: Dish, quantity: number = 1, preferences: string = "") => {
            setItems((prev) => {
                const existing = prev.find((item) => item.dish.dish_id === dish.dish_id);
                if (existing) {
                    return prev.map((item) =>
                        item.dish.dish_id === dish.dish_id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }
                return [...prev, { dish, quantity, preferences }];
            });
        },
        []
    );

    const removeItem = useCallback((dishId: number) => {
        setItems((prev) => prev.filter((item) => item.dish.dish_id !== dishId));
    }, []);

    const updateQuantity = useCallback(
        (dishId: number, quantity: number) => {
            if (quantity <= 0) {
                removeItem(dishId);
                return;
            }
            setItems((prev) =>
                prev.map((item) =>
                    item.dish.dish_id === dishId ? { ...item, quantity } : item
                )
            );
        },
        [removeItem]
    );

    const updatePreferences = useCallback((dishId: number, preferences: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.dish.dish_id === dishId ? { ...item, preferences } : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalPrice = items.reduce(
        (sum, item) => sum + item.dish.price * item.quantity,
        0
    );

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                updatePreferences,
                clearCart,
                totalPrice,
                totalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
