// lib/constants.ts
import { API_BASE_URL as API_URL } from "./config";

export const API_BASE_URL = API_URL;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "chef_access_token",
  USER_PROFILE: "chef_user_profile",
} as const;

// Query Keys
export const QUERY_KEYS = {
  PROFILE: ["profile"],
  ORDERS: (userId: number) => ["orders", userId],
  DISHES: (params: any) => ["dishes", params],
} as const;

// Dish Types
export const DISH_TYPES = {
  appetizer: "Закуска",
  main: "Основное блюдо",
  dessert: "Десерт",
  drink: "Напиток",
  salad: "Салат",
  soup: "Суп",
} as const;

// Order Status
export const ORDER_STATUS = {
  pending: "Ожидание",
  confirmed: "Подтверждено",
  delivered: "Доставлено",
  cancelled: "Отменено",
} as const;
