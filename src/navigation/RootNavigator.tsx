import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, StatusBar } from "react-native";
import { useAuthStatus } from "../lib/hooks";
import { useTheme } from "../lib/theme";
import AuthStack from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { getNavTheme } from "../lib/constants";
import FlashMessage from "react-native-flash-message";

// Detail screens
import SettingsScreen from "../screens/main/SettingsScreen";
import ChefDetailScreen from "../screens/detail/ChefDetailScreen";
import DishDetailScreen from "../screens/detail/DishDetailScreen";
import AddDishScreen from "../screens/chef/AddDishScreen";
import AddVideoScreen from "../screens/chef/AddVideoScreen";

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { data: user, isLoading } = useAuthStatus();
  const { themeName } = useTheme();
  const theme = getNavTheme(themeName);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
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
