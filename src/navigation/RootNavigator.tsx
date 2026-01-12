import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, StatusBar, Text, Button } from "react-native";
import { useAuthStatus } from "../lib/hooks";
import { useTheme } from "../lib/theme";
import AuthStack from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { getNavTheme, API_BASE_URL } from "../lib/constants";
import FlashMessage from "react-native-flash-message";
import type { RootStackParamList } from "./types";

// Detail screens
import SettingsScreen from "../screens/main/SettingsScreen";
import ChefDetailScreen from "../screens/detail/ChefDetailScreen";
import DishDetailScreen from "../screens/detail/DishDetailScreen";
import AddDishScreen from "../screens/chef/AddDishScreen";
import AddVideoScreen from "../screens/chef/AddVideoScreen";
import AddressManagementScreen from "../screens/settings/AddressManagementScreen";

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { data: user, isLoading, isError, error, refetch } = useAuthStatus();
  const { themeName } = useTheme();
  const theme = getNavTheme(themeName);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If there's an error (network, server 500), don't log out the user.
  // Show a retry screen or keep loading.
  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ marginBottom: 10, fontSize: 18, textAlign: "center" }}>
          Проблема с соединением
        </Text>
        <Text style={{ marginBottom: 20, color: "gray", textAlign: "center" }}>
          Trying: {API_BASE_URL} {"\n"}
          Error: {error?.message}
        </Text>
        <Button title="Повторить" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={themeName === "dark" ? "light-content" : "dark-content"} />
      <NavigationContainer theme={theme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: true, title: "Настройки" }}
              />
              <Stack.Screen
                name="ChefDetail"
                component={ChefDetailScreen}
                options={{ headerShown: true, title: "Профиль повара" }}
              />
              <Stack.Screen
                name="DishDetail"
                component={DishDetailScreen}
                options={{ headerShown: true, title: "Блюдо" }}
              />
              <Stack.Screen
                name="AddDish"
                component={AddDishScreen}
                options={{ headerShown: true, title: "Добавить блюдо" }}
              />
              <Stack.Screen
                name="AddVideo"
                component={AddVideoScreen}
                options={{ headerShown: true, title: "Добавить видео" }}
              />
              <Stack.Screen
                name="AddressManagement"
                component={AddressManagementScreen}
                options={{ headerShown: true, title: "Мои адреса" }}
              />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthStack} />
          )}
        </Stack.Navigator>
        <FlashMessage position="top" />
      </NavigationContainer>
    </>
  );
}
