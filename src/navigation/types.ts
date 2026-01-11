import type { StackScreenProps } from "@react-navigation/stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { UserRole } from "../lib/types";

// Auth stack - authentication first, then role selection
export type AuthStackParamList = {
  Start: undefined;
  Login: undefined;
  Register: undefined;
  RoleSelection: undefined;
};

// Main bottom navigation - 4 tabs
export type MainTabParamList = {
  Feed: undefined;
  Search: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  DishDetail: { dishId: number };
  ChefDetail: { chefId: number };
  Settings: undefined;
  AddDish: undefined;
  AddVideo: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;