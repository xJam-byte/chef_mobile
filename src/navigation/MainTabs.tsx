import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { MainTabParamList } from "./types";
import { useColors } from "../lib/theme";

import FeedScreen from "../screens/main/FeedScreen";
import SearchScreen from "../screens/main/SearchScreen";
import CartScreen from "../screens/main/CartScreen";
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
      {/* Feed - Video feed */}
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: "Лента",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-circle-outline" color={color} size={size} />
          ),
        }}
      />

      {/* Search - Map + Smart Search + Menu */}
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: "Поиск",
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
        }}
      />

      {/* Cart */}
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

      {/* Profile */}
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