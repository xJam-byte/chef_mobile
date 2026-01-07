/**
 * Types (Navigation + Auth DTO minimal)
 */

import type { StackScreenProps } from "@react-navigation/stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { UserRole } from "../lib/types"; // Импортируем UserRole

// --------------------
// NAVIGATION TYPES
// --------------------
export type AuthStackParamList = {
  Start: undefined;
  RoleSelect: { action: "login" | "register" };
  Login: { role: UserRole };
  Register: { role: UserRole };
};

export type MainTabParamList = {
  Feed: undefined;
  Catalog: undefined;
  Chefs: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  DishDetail: { dishId: number };
  ChefDetail: { chefId: number };
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type MainScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<MainTabScreenProps<T>, RootStackScreenProps<"Main">>;
