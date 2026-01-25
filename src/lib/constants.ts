import { DefaultTheme, DarkTheme, type Theme } from "@react-navigation/native";
import { API_BASE_URL } from "./config";

export { API_BASE_URL };

export const LIGHT_COLORS = {
  primary: "#F97316",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",

  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
};

export const DARK_COLORS = {
  primary: "#F97316",
  background: "#0B1220",
  surface: "#111A2E",
  text: "#E5E7EB",
  textSecondary: "#A1A1AA",
  textMuted: "#6B7280",
  border: "#1F2A44",

  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#60A5FA",
};

// Backward-compatible: всё старое приложение продолжает брать COLORS (светлая тема)
export const COLORS = LIGHT_COLORS;

export const ORDER_STATUS = {
  pending: "В ожидании",
  confirmed: "Подтверждён",
  delivered: "Доставлен",
  cancelled: "Отменён",
} as const;

export const DISH_TYPES = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  dessert: "Десерт",
  drink: "Напиток",
} as const;

export const QUERY_KEYS = {

  PROFILE: () => ["profile"] as const,

  USERS: () => ["users"] as const,
  USER: (id?: number) => ["user", id] as const,

  REVIEWS: (chefId?: number) => ["reviews", chefId] as const,
  // AUTH

  // DISHES
  DISHES: (params: Record<string, any> = {}) => ["dishes", params] as const,
  DISH: (id?: number) => ["dish", id] as const,
  CHEF_DISHES: (chefId?: number) => ["chef-dishes", chefId] as const,

  // CHEFS
  CHEFS: (params: Record<string, any> = {}) => ["chefs", params] as const,
  CHEF: (id?: number) => ["chef", id] as const,

  // ORDERS
  ORDERS: (params: Record<string, any> = {}) => ["orders", params] as const,
  CHEF_ORDERS: (userId?: number) => ["chef-orders", userId] as const,
  ORDER: (id?: number) => ["order", id] as const,

  // CART (если нужно)
  CART: () => ["cart"] as const,
} as const;



export type ThemeMode = "light" | "dark";

export function getNavTheme(mode: ThemeMode): Theme {
  const palette = mode === "dark" ? DARK_COLORS : LIGHT_COLORS;

  const base = mode === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      primary: palette.primary,
    },
  };
}
