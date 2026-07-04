import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function SuccessScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Reset navigation stack so user can't go back to checkout
  const handleGoHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      }),
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.content}>
        <View
          style={[styles.iconContainer, { backgroundColor: c.success + "20" }]}
        >
          <Ionicons name="checkmark" size={64} color={c.success} />
        </View>

        <Text style={[styles.title, { color: c.text }]}>
          {t("checkout.successTitle") || "Order Placed!"}
        </Text>

        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {t("checkout.successMessage") ||
            "Your order has been placed successfully. You can track its status in your orders."}
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: c.primary }]}
          onPress={handleGoHome}
        >
          <Text style={[styles.buttonText, { color: "#fff" }]}>
            {t("common.backToHome") || "Back to Home"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton]}
          onPress={() => {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: "MainTabs" },
                  { name: "OrderTracking" }, // Assuming this route exists or goes to Orders
                ],
              }),
            );
          }}
        >
          <Text style={[styles.secondaryButtonText, { color: c.text }]}>
            {t("checkout.trackOrder") || "Track Order"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
