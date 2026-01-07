/**
 * Login Screen (theme-aware)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Input } from "../../components/ui";
import { useLogin } from "../../lib/hooks";
import { useColors } from "../../lib/theme";
import { AuthScreenProps } from "../../navigation/types";

const LoginScreen = ({ navigation }: AuthScreenProps<"Login">) => {
  const c = useColors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const loginMutation = useLogin();

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) newErrors.email = "Email обязателен";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Неверный формат email";

    if (!password) newErrors.password = "Пароль обязателен";
    else if (password.length < 6) newErrors.password = "Минимум 6 символов";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error: any) {
      console.error("Login error:", error);

      const errorMessage = error.response?.data?.message
        ? Array.isArray(error.response.data.message)
          ? error.response.data.message.join(", ")
          : error.response.data.message
        : "Неверные данные для входа";

      Alert.alert("Ошибка входа", errorMessage);
    }
  };

  return (
    <LinearGradient colors={c.authGradient} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Chef</Text>
            <Text
              style={[
                styles.subtitle,
                { color: c.name === "dark" ? "#9CA3AF" : "#FED7AA" },
              ]}
            >
              Домашняя еда от лучших поваров
            </Text>
          </View>

          {/* Card */}
          <View
            style={[
              styles.card,
              { backgroundColor: c.authCard, borderColor: c.authCardBorder },
            ]}
          >
            <Text style={[styles.cardTitle, { color: c.text }]}>
              Вход в аккаунт
            </Text>

            <Input
              label="Email"
              placeholder="ivan@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((e) => ({ ...e, email: undefined }));
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
            />

            <Input
              label="Пароль"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((e) => ({ ...e, password: undefined }));
              }}
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Войти"
              onPress={handleLogin}
              loading={loginMutation.isPending}
              fullWidth
              style={styles.loginButton}
            />

            <Text
              style={[styles.registerText, { color: c.primary }]}
              onPress={() =>
                navigation.navigate("Register", { role: "customer" })
              }
            >
              Создать аккаунт
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
  },
  registerText: {
    marginTop: 20,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});
