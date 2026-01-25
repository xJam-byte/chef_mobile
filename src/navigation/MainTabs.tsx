import React from "react";
import { View, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { MainTabParamList } from "./types";
import { useColors } from "../lib/theme";

import FeedScreen from "../screens/main/FeedScreen";
import SearchScreen from "../screens/main/SearchScreen";
import CartScreen from "../screens/main/CartScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import ProfileScreen from "../screens/main/ProfileScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  const c = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: c.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64, // Reduced height since no labels
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
        headerShown: false, // Premium design: we use custom headers inside screens
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
          // headerShown: true,
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

      {/* Orders */}
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: "Orders",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" color={color} size={size} />
          ),
        }}
      />

      {/* Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: "Профиль",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 16, paddingRight: 16 }}>
              <TouchableOpacity onPress={() => navigation.navigate("Cart")} activeOpacity={0.7}>
                <Ionicons name="cart-outline" size={24} color={c.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => (navigation as any).navigate("Settings")} activeOpacity={0.7}>
                <Ionicons name="settings-outline" size={24} color={c.text} />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
    </Tab.Navigator>
  );
};