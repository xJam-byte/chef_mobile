import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { Spinner } from "../components/ui";
import { ThemeProvider } from "../lib/theme";
import { useColors } from "../lib/theme";
import { useAuthStatus } from "../lib/hooks/useAuth";

import DishDetailScreen from "../screens/detail/DishDetailScreen";
import ChefDetailScreen from "../screens/detail/ChefDetailScreen";

const Stack = createStackNavigator<RootStackParamList>();

function Inner() {
  const c = useColors();
  const { isLoading, isAuthenticated } = useAuthStatus();

  if (isLoading) return <Spinner fullScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="DishDetail"
              component={DishDetailScreen}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: c.surface },
                headerTintColor: c.text,
                title: "Блюдо",
              }}
            />
            <Stack.Screen
              name="ChefDetail"
              component={ChefDetailScreen}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: c.surface },
                headerTintColor: c.text,
                title: "Шеф-повар",
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export const RootNavigator = () => (
  <ThemeProvider>
    <Inner />
  </ThemeProvider>
);
