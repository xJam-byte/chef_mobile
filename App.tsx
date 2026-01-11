/**
 * Chef Mobile App
 * Food ordering from home chefs
 */

import React from "react";
import { StatusBar } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./src/lib/i18n"; // Initialize i18n
import { CartProvider } from "./src/context/CartContext";
import { ThemeProvider } from "./src/lib/theme";
import RootNavigator from "./src/navigation/RootNavigator";

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <CartProvider>
              <RootNavigator />
            </CartProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
