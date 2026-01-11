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

const RegisterScreen = ({ navigation }: AuthScreenProps<"Register">) => {
  const c = useColors();

  const registerMutation = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await registerMutation.mutateAsync({
        name,
        email,
        password,
      });
      // After successful registration, navigate to role selection
      navigation.navigate("RoleSelection");
    } catch (e: any) {
      const msgRaw = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message;

      const msg =
        Array.isArray(msgRaw) ? msgRaw.join("\n") :
          typeof msgRaw === "string" ? msgRaw :
            JSON.stringify(e?.response?.data ?? {}, null, 2);

      Alert.alert("Ошибка регистрации", msg);
    }
  };

  return (
    <LinearGradient colors={c.authGradient} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Регистрация</Text>

          <View style={[styles.card, { backgroundColor: c.authCard }]}>
            <Input label="Имя" value={name} onChangeText={setName} />
            <Input label="Email" value={email} onChangeText={setEmail} />
            <Input
              label="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Зарегистрироваться"
              onPress={handleRegister}
              loading={registerMutation.isPending}
              fullWidth
            />

            <Text
              style={[styles.link, { color: c.primary }]}
              onPress={() => navigation.navigate("Login")}
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
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  card: { borderRadius: 24, padding: 24 },
  link: { marginTop: 20, textAlign: "center", fontWeight: "700" },
});
