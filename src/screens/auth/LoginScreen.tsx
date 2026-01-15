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
import { useSendSms, useVerifySms } from "../../lib/hooks";
import { useColors } from "../../lib/theme";
import { AuthScreenProps } from "../../navigation/types";

const LoginScreen = ({ navigation }: AuthScreenProps<"Login">) => {
  const c = useColors();
  const { t } = useTranslation();

  const sendSmsMutation = useSendSms();
  const verifySmsMutation = useVerifySms();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(0);

  const formatPhoneNumber = (text: string) => {
    const digits = text.replace(/\D/g, "");
    if (!digits) return "";
    
    let formatted = "+7";
    if (digits.length > 1) formatted += " (" + digits.substring(1, 4);
    if (digits.length >= 5) formatted += ") " + digits.substring(4, 7);
    if (digits.length >= 8) formatted += "-" + digits.substring(7, 9);
    if (digits.length >= 10) formatted += "-" + digits.substring(9, 11);
    
    return formatted;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const getRawPhoneNumber = (formatted: string) => {
    return "+" + formatted.replace(/\D/g, "");
  };

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendSms = async () => {
    try {
      const rawPhone = getRawPhoneNumber(phoneNumber);
      
      if (rawPhone.length < 12) {
        Alert.alert(t('common.error'), t('auth.errorInvalidPhone'));
        return;
      }

      await sendSmsMutation.mutateAsync({ phone_number: rawPhone });
      setStep("code");
      startTimer();
      Alert.alert(t('common.success'), t('auth.successSmsSent'));
    } catch (e: any) {
      Alert.alert(
        t('common.error'),
        e?.response?.data?.message ?? t('auth.errorSmsSend')
      );
    }
  };

  const handleVerifySms = async () => {
    try {
      const rawPhone = getRawPhoneNumber(phoneNumber);
      
      if (code.length !== 6) {
        Alert.alert(t('common.error'), t('auth.errorInvalidCode'));
        return;
      }

      await verifySmsMutation.mutateAsync({
        phone_number: rawPhone,
        code: code.trim(),
      });
      
      // RootNavigator will handle navigation to Main
    } catch (e: any) {
      Alert.alert(
        t('auth.errorLogin'),
        e?.response?.data?.message ?? t('auth.errorInvalidSmsCode')
      );
    }
  };

  const handleResendSms = async () => {
    if (timer > 0) return;
    await handleSendSms();
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
              {step === "phone" ? t('auth.loginToAccount') : t('auth.enterSmsCode')}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: c.authCard }]}>
            <Text style={[styles.cardTitle, { color: c.text }]}>
              {step === "phone" ? t('auth.welcome') : t('auth.confirmation')}
            </Text>

            {step === "phone" ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: c.text }]}>{t('auth.phoneLabel')}</Text>
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

                <Button
                  title={t('auth.getCode')}
                  onPress={handleSendSms}
                  loading={sendSmsMutation.isPending}
                  fullWidth
                />
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: c.text }]}>{t('auth.smsCodeLabel')}</Text>
                  <TextInput
                    style={[styles.codeInput, { backgroundColor: c.input, color: c.text }]}
                    value={code}
                    onChangeText={setCode}
                    placeholder={t('auth.smsCodePlaceholder')}
                    placeholderTextColor={c.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>

                <Button
                  title={t('auth.login')}
                  onPress={handleVerifySms}
                  loading={verifySmsMutation.isPending}
                  fullWidth
                />

                <Text
                  style={[styles.resendLink, { 
                    color: timer > 0 ? c.textSecondary : c.primary 
                  }]}
                  onPress={handleResendSms}
                  disabled={timer > 0}
                >
                  {timer > 0 
                    ? t('auth.resendIn', { seconds: timer })
                    : t('auth.resendCode')}
                </Text>

                <Text
                  style={[styles.backLink, { color: c.textSecondary }]}
                  onPress={() => setStep("phone")}
                >
                  {t('auth.changeNumber')}
                </Text>
              </>
            )}

            <Text
              style={[styles.link, { color: c.primary }]}
              onPress={() => navigation.navigate("Register")}
            >
              {t('auth.createAccount')}
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
  codeInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 8,
  },
  resendLink: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  backLink: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },
});
