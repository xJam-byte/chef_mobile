import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { PremiumHeader } from "../../components/ui/PremiumHeader";
import { SafeAreaView } from "react-native-safe-area-context";

// A simple placeholder for now to fix the build
export default function OrderTrackingScreen({ route, navigation }: any) {
  const c = useColors();
  const { t } = useTranslation();

  // In a real app, we'd get orderId from route.params and fetch status
  const { orderId } = route.params || {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader
        title={t("order.trackingTitle") || "Order Tracking"}
        backButton
      />

      <View style={styles.centerContent}>
        <Ionicons name="map-outline" size={80} color={c.textMuted} />
        <Text style={[styles.title, { color: c.text }]}>
          {t("order.trackingComingSoon") || "Live Tracking"}
        </Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {t("order.trackingDescription") ||
            "Real-time courier tracking will be available here soon."}
        </Text>

        {orderId && (
          <Text style={{ color: c.primary, marginTop: 20 }}>
            Order ID: {orderId}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: c.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {t("common.close") || "Close"}
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
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  btn: {
    marginTop: 40,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
});
