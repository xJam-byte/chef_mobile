import type { StackScreenProps } from "@react-navigation/stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { UserRole } from "../lib/types";
import { NavigatorScreenParams } from "@react-navigation/native";
import type { VideoFeedItem } from "../lib/api/videos";

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
  Orders: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Settings: undefined;
  ChefDetail: { chefId: number };
  DishDetail: { dishId: number };
  OrderDetail: { orderId: number };
  OrderTracking: { orderId: number };
  AddDish: undefined;
  AddVideo: undefined;
  AddressManagement: { mode?: "select" };
  VideoViewer: { video: VideoFeedItem };
  Checkout: undefined;
  Payment: { addressId: number; totalAmount: number };
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