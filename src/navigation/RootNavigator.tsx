import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStatus } from "../lib/hooks";
import { RootStackParamList } from "./types";
import { useTheme } from "../lib/theme";

// Screens
import AuthStack from "./AuthStack";
import { MainTabs } from "./MainTabs";
import DishDetailScreen from "../screens/detail/DishDetailScreen";
import ChefDetailScreen from "../screens/detail/ChefDetailScreen";
import AddDishScreen from "../screens/chef/AddDishScreen";
import AddVideoScreen from "../screens/chef/AddVideoScreen";
import SettingsScreen from "../screens/main/SettingsScreen";
import WalletScreen from "../screens/WalletScreen";
import ReferralScreen from "../screens/ReferralScreen";
import BattleScreen from "../screens/BattleScreen";
import CertificationScreen from "../screens/CertificationScreen";
import ChefScheduleScreen from "../screens/ChefScheduleScreen";
import CheckoutScreen from "../screens/checkout/CheckoutScreen";
import PaymentScreen from "../screens/checkout/PaymentScreen";
import SuccessScreen from "../screens/checkout/SuccessScreen";
import AddressManagementScreen from "../screens/settings/AddressManagementScreen";
import OrderTrackingScreen from "../screens/orders/OrderTrackingScreen";
import OrderDetailScreen from "../screens/detail/OrderDetailScreen";
import TermsScreen from "../screens/settings/TermsScreen";
import PrivacyScreen from "../screens/settings/PrivacyScreen";
import SupportScreen from "../screens/settings/SupportScreen";
import VideoViewerScreen from "../screens/video/VideoViewerScreen";

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { data: user, isLoading } = useAuthStatus();
  const { theme, themeName } = useTheme();

  const isAuthenticated = !!user;

  if (isLoading) {
    return null;
  }

  // Adapt theme for React Navigation
  const navigationTheme = {
    dark:
      themeName === "dark" || (themeName === "system" && theme.name === "dark"),
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
      bold: { fontFamily: 'System', fontWeight: '700' as const },
      heavy: { fontFamily: 'System', fontWeight: '800' as const },
    },
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.error,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: "card",
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="DishDetail" component={DishDetailScreen} />
            <Stack.Screen name="ChefDetail" component={ChefDetailScreen} />
            <Stack.Screen name="AddDish" component={AddDishScreen} />
            <Stack.Screen name="AddVideo" component={AddVideoScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="Referral" component={ReferralScreen} />
            <Stack.Screen name="Battle" component={BattleScreen} />
            <Stack.Screen name="Certification" component={CertificationScreen} />
            <Stack.Screen name="ChefSchedule" component={ChefScheduleScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen
              name="AddressManagement"
              component={AddressManagementScreen}
            />
            <Stack.Screen
              name="OrderTracking"
              component={OrderTrackingScreen}
            />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="VideoViewer" component={VideoViewerScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
