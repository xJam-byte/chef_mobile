/**
 * Chef Mobile App
 * Food ordering from home chefs
 */

import React from "react";
import { StatusBar } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FlashMessage from "react-native-flash-message";
import "./src/lib/i18n"; // Initialize i18n
import { CartProvider } from "./src/lib/hooks/useCart";
import { ThemeProvider } from "./src/lib/theme";
import RootNavigator from "./src/navigation/RootNavigator";
import { useProfile } from "./src/lib/hooks";

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

import { useState } from "react";
import { DraggableAiButton } from "./src/components/ai/DraggableAiButton";
import { AiChatModal } from "./src/components/ai/AiChatModal";

function AiAssistantOverlay() {
  const [isChatOpen, setChatOpen] = useState(false);

  return (
    <>
      <DraggableAiButton onPress={() => setChatOpen(true)} />
      <AiChatModal visible={isChatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

// Wrapper to provide userId to CartProvider
function CartProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { data: profile } = useProfile();
  const userId = profile?.user_id ?? null;

  return (
    <CartProvider userId={userId}>
      {children}
      {/* {userId && <AiAssistantOverlay />} */}
    </CartProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <CartProviderWithAuth>
              <RootNavigator />
              <FlashMessage position="top" />
            </CartProviderWithAuth>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
