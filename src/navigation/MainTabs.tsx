/**
 * Main Tab Navigator
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { MainTabParamList } from "./types";
import { useColors } from "../lib/theme";

// Импортируем экраны
import FeedScreen from "../screens/main/FeedScreen";
import HomeScreen from "../screens/main/HomeScreen";
import ChefsScreen from "../screens/main/ChefsScreen";
import CartScreen from "../screens/main/CartScreen";
import OrdersScreen from "../screens/main/OrdersScreen";
import ProfileScreen from "../screens/main/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  const c = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: c.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          backgroundColor: c.surface,
        },
        headerStyle: {
          backgroundColor: c.surface,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        },
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
          color: c.text,
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: "Лента",
          headerShown: false, // Скрываем хедер для полноэкранного видео
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Catalog"
        component={HomeScreen}
        options={{
          title: "Меню",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chefs"
        component={ChefsScreen}
        options={{
          title: "Повара",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: "Корзина",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: "Заказы",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Профиль",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
