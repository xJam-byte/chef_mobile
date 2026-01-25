import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { AuthScreenProps } from "../../navigation/types";

const { height } = Dimensions.get("window");

export default function AuthStartScreen({ navigation }: AuthScreenProps<"Start">) {
  const c = useColors();
  const { t } = useTranslation();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={c.authGradient} style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title Section */}
        <Animated.View 
          style={[
            styles.header, 
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.logoContainer, 
              { transform: [{ scale: logoScale }] }
            ]}
          >
            <View style={styles.logoCircle}>
              <View style={styles.logoInnerCircle}>
                <Ionicons name="restaurant" size={42} color={c.primary} />
              </View>
            </View>
          </Animated.View>
          
          <Text style={styles.title}>Chef</Text>
          <Text style={styles.subtitle}>
            {t('auth.startSubtitle') || "Order delicious food or start your own kitchen today."}
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View 
            style={[
              styles.features,
              { opacity: fadeAnim }
            ]}
        >
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="fast-food" size={20} color="#fff" />
            </View>
            <Text style={styles.featureText}>{t('auth.features.fastOrder') || "Fast Delivery"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="star" size={20} color="#fff" />
            </View>
            <Text style={styles.featureText}>{t('auth.features.topChefs') || "Top Chefs"}</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          style={[
            styles.actions, 
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: Animated.multiply(slideAnim, -0.5) }] 
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { backgroundColor: "#fff" }]}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.9}
          >
            <Text style={[styles.buttonText, { color: c.primary }]}>{t('auth.login')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { borderColor: "rgba(255,255,255,0.4)" },
            ]}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>{t('auth.createAccount')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: height * 0.05,
  },
  header: {
    alignItems: "center",
    marginTop: height * 0.05,
  },
  logoContainer: {
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 56,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 16,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
    fontWeight: "500",
  },
  features: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center',
    gap: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureIcon: {
    opacity: 0.9,
  },
  featureText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "700",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  actions: {
    gap: 16,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 20,
    borderRadius: 20,
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
    borderWidth: 1.5,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "800",
  },
});
