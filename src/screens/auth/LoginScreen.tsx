/**
 * Login Screen (react-query auth)
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

  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email обязателен";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Неверный формат email";
    if (!password) e.password = "Пароль обязателен";
    else if (password.length < 6) e.password = "Минимум 6 символов";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const data = await loginMutation.mutateAsync({ email, password });

      // Check if user has a role set, if not navigate to role selection
      if (!data.user.role || data.user.role === "admin") {
        navigation.navigate("RoleSelection");
      }
      // Otherwise RootNavigator will handle navigation to Main
    } catch (e: any) {
      Alert.alert(
        "Ошибка входа",
        e?.response?.data?.message ?? "Неверные данные"
      );
    }
  };

  return (
    <LinearGradient colors={c.authGradient} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Chef</Text>
            <Text style={styles.subtitle}>
              Вход в аккаунт
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: c.authCard }]}>
            <Text style={[styles.cardTitle, { color: c.text }]}>
              Добро пожаловать
            </Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />

            <Input
              label="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Войти"
              onPress={handleLogin}
              loading={loginMutation.isPending}
              fullWidth
            />

            <Text
              style={[styles.link, { color: c.primary }]}
              onPress={() => navigation.navigate("Register")}
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
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 36, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 16, color: "#cbd5f5" },
  card: { borderRadius: 24, padding: 24 },
  cardTitle: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  link: { marginTop: 20, textAlign: "center", fontWeight: "700" },
});
