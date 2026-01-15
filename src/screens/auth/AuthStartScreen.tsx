import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { AuthScreenProps } from "../../navigation/types";

export default function AuthStartScreen({ navigation }: AuthScreenProps<"Start">) {
  const c = useColors();
  const { t } = useTranslation();

  return (
    <LinearGradient colors={c.authGradient} style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title Section */}
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Ionicons name="restaurant" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>Chef</Text>
          <Text style={styles.subtitle}>
            {t('auth.startSubtitle')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { backgroundColor: "#fff" }]}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: c.primary }]}>{t('auth.login')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { borderColor: "rgba(255,255,255,0.5)" },
            ]}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>{t('auth.createAccount')}</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="videocam" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featureText}>{t('auth.features.videos')}</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="cart" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featureText}>{t('auth.features.fastOrder')}</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="star" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featureText}>{t('auth.features.topChefs')}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  actions: {
    gap: 16,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
  },
  feature: {
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
});
