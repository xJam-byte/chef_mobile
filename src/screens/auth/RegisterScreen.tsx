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
import { useRegister } from "../../lib/hooks";
import type { AuthScreenProps } from "../../navigation/types";
import { useColors } from "../../lib/theme";

const RegisterScreen = ({ navigation, route }: AuthScreenProps<"Register">) => {
  const c = useColors();
  const { role } = route.params; // Получаем роль (user или chef)

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const registerMutation = useRegister();

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name) newErrors.name = "Имя обязательно";

    if (!email) newErrors.email = "Email обязателен";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Неверный формат email";

    if (!password) newErrors.password = "Пароль обязателен";
    else if (password.length < 6) newErrors.password = "Минимум 6 символов";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      await registerMutation.mutateAsync({
        name,
        email,
        password,
        phone_number: phoneNumber || undefined,
        role: role === "chef" ? "customer" : role,
      });
      // После успеха хук useRegister обновит состояние, навигация произойдет автоматически через AuthStatus
    } catch (error: any) {
      console.error("Register error:", error);

      const errorMessage = error.response?.data?.message
        ? Array.isArray(error.response.data.message)
          ? error.response.data.message.join(", ")
          : error.response.data.message
        : "Ошибка регистрации";

      Alert.alert("Ошибка", errorMessage);
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
            <Text
              style={[
                styles.subtitle,
                { color: c.name === "dark" ? "#9CA3AF" : "#FED7AA" },
              ]}
            >
              Создание аккаунта: {role === "chef" ? "Шеф-повар" : "Клиент"}
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: c.authCard, borderColor: c.authCardBorder },
            ]}
          >
            <Text style={[styles.cardTitle, { color: c.text }]}>
              Регистрация
            </Text>

            <Input
              label="Имя"
              placeholder="Иван Иванов"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((e) => ({ ...e, name: undefined }));
              }}
              error={errors.name}
            />

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

            <Input
              label="Телефон (опционально)"
              placeholder="+7 (705) 123-45-67"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            <Button
              title="Зарегистрироваться"
              onPress={handleRegister}
              loading={registerMutation.isPending}
              fullWidth
              style={styles.registerButton}
            />

            <Text
              style={[styles.loginText, { color: c.primary }]}
              onPress={() => navigation.navigate("Login", { role })}
            >
              Уже есть аккаунт? Войти
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
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
  registerButton: {
    marginTop: 8,
  },
  loginText: {
    marginTop: 20,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});
