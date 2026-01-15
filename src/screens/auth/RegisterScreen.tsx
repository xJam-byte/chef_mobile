import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Button, Input } from "../../components/ui";
import { useRegister } from "../../lib/hooks";
import type { AuthScreenProps } from "../../navigation/types";
import { useColors } from "../../lib/theme";

const RegisterScreen = ({ navigation }: AuthScreenProps<"Register">) => {
  const c = useColors();
  const { t } = useTranslation();

  const registerMutation = useRegister();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const digits = text.replace(/\D/g, "");
    
    // Don't format if empty
    if (!digits) return "";
    
    // Format as +7 (XXX) XXX-XX-XX
    let formatted = "+7";
    if (digits.length > 1) {
      formatted += " (" + digits.substring(1, 4);
    }
    if (digits.length >= 5) {
      formatted += ") " + digits.substring(4, 7);
    }
    if (digits.length >= 8) {
      formatted += "-" + digits.substring(7, 9);
    }
    if (digits.length >= 10) {
      formatted += "-" + digits.substring(9, 11);
    }
    
    return formatted;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const getRawPhoneNumber = (formatted: string) => {
    return "+" + formatted.replace(/\D/g, "");
  };

  const handleRegister = async () => {
    try {
      const rawPhone = getRawPhoneNumber(phoneNumber);
      
      if (rawPhone.length < 12) {
        Alert.alert(t('common.error'), t('auth.errorInvalidPhone'));
        return;
      }

      await registerMutation.mutateAsync({
        name: name.trim(),
        phone_number: rawPhone,
        email: email.trim() || undefined,
        password: password.trim(),
      });
      
      navigation.navigate("RoleSelection");
    } catch (e: any) {
      const msgRaw = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message;

      const msg =
        Array.isArray(msgRaw) ? msgRaw.join("\n") :
          typeof msgRaw === "string" ? msgRaw :
            JSON.stringify(e?.response?.data ?? {}, null, 2);

      Alert.alert(t('auth.errorRegistration'), msg);
    }
  };

  return (
    <LinearGradient colors={c.authGradient} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t('auth.registrationTitle')}</Text>

          <View style={[styles.card, { backgroundColor: c.authCard }]}>
            <Input label={t('auth.nameLabel')} value={name} onChangeText={setName} />
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: c.text }]}>{t('auth.phoneRequired')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.input, color: c.text }]}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                placeholder={t('auth.phonePlaceholder')}
                placeholderTextColor={c.textSecondary}
                keyboardType="phone-pad"
                maxLength={18}
              />
            </View>

            <Input 
              label={t('auth.emailOptional')} 
              value={email} 
              onChangeText={setEmail} 
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <Input
              label={t('auth.passwordLabel')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title={t('auth.registerButton')}
              onPress={handleRegister}
              loading={registerMutation.isPending}
              fullWidth
            />

            <Text
              style={[styles.link, { color: c.primary }]}
              onPress={() => navigation.navigate("Login")}
            >
              {t('auth.alreadyHaveAccountLogin')}
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
  inputContainer: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
});
