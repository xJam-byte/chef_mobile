import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui";
import { useSendSms, useVerifySms, useLoginEmail } from "../../lib/hooks";
import { useColors } from "../../lib/theme";
import { AuthScreenProps } from "../../navigation/types";

const { width } = Dimensions.get("window");

const LoginScreen = ({ navigation }: AuthScreenProps<"Login">) => {
  const c = useColors();
  const { t } = useTranslation();

  const sendSmsMutation = useSendSms();
  const verifySmsMutation = useVerifySms();
  const loginEmailMutation = useLoginEmail();

  const [step, setStep] = useState<"select" | "phone" | "code" | "email">(
    "select",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(0);

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
        Alert.alert(t("common.error"), t("auth.errorInvalidPhone"));
        return;
      }

      await sendSmsMutation.mutateAsync({ phone_number: rawPhone });
      setStep("code");
      startTimer();
      // Animate transition
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert(t("common.success"), t("auth.successSmsSent"));
    } catch (e: any) {
      Alert.alert(
        t("common.error"),
        e?.response?.data?.message ?? t("auth.errorSmsSend"),
      );
    }
  };

  const handleVerifySms = async () => {
    try {
      const rawPhone = getRawPhoneNumber(phoneNumber);

      if (code.length !== 6) {
        Alert.alert(t("common.error"), t("auth.errorInvalidCode"));
        return;
      }

      await verifySmsMutation.mutateAsync({
        phone_number: rawPhone,
        code: code.trim(),
      });

      // RootNavigator will handle navigation to Main
    } catch (e: any) {
      Alert.alert(
        t("auth.errorLogin"),
        e?.response?.data?.message ?? t("auth.errorInvalidSmsCode"),
      );
    }
  };

  const handleLoginEmail = async () => {
    try {
      if (!email || !password) {
        Alert.alert(
          t("common.error"),
          t("auth.errorAllFieldsRequired") || "Please fill all fields",
        );
        return;
      }
      await loginEmailMutation.mutateAsync({ email: email.trim(), password });
    } catch (e: any) {
      Alert.alert(
        t("common.error"),
        e?.response?.data?.message || t("auth.errorLoginFailed"),
      );
    }
  };

  const handleResendSms = async () => {
    if (timer > 0) return;
    await handleSendSms();
  };

  return (
    <LinearGradient colors={c.authGradient} style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            </View>
            <Animated.Text
              style={[
                styles.title,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              {t("auth.welcomeBack")}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.subtitle,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              {step === "select"
                ? t("auth.selectLoginMethod")
                : step === "email"
                  ? t("auth.loginWithEmail")
                  : step === "phone"
                    ? t("auth.loginToAccount")
                    : t("auth.enterSmsCode")}
            </Animated.Text>
          </View>

          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: c.authCard,
                borderColor: c.authCardBorder,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {step === "select" ? (
              <View style={{ gap: 16 }}>
                <TouchableOpacity
                  style={[styles.methodButton, { backgroundColor: c.input }]}
                  onPress={() => setStep("phone")}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={24}
                    color={c.primary}
                  />
                  <Text style={[styles.methodButtonText, { color: c.text }]}>
                    {t("auth.continueWithPhone") || "Continue with Phone"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.methodButton, { backgroundColor: c.input }]}
                  onPress={() => setStep("email")}
                >
                  <Ionicons name="mail-outline" size={24} color={c.primary} />
                  <Text style={[styles.methodButtonText, { color: c.text }]}>
                    {t("auth.continueWithEmail") || "Continue with Email"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : step === "email" ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: c.text }]}>
                    {t("auth.emailOptional")}
                  </Text>
                  <View
                    style={[styles.inputWrapper, { backgroundColor: c.input }]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={c.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: c.text }]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder={t("auth.emailPlaceholder")}
                      placeholderTextColor={c.textSecondary}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: c.text }]}>
                    {t("auth.passwordLabel")}
                  </Text>
                  <View
                    style={[styles.inputWrapper, { backgroundColor: c.input }]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={c.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: c.text }]}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      placeholder={t("auth.passwordPlaceholder")}
                      placeholderTextColor={c.textSecondary}
                    />
                  </View>
                </View>

                <Button
                  title={t("auth.login")}
                  onPress={handleLoginEmail}
                  loading={loginEmailMutation.isPending}
                  fullWidth
                  style={{ marginTop: 8 }}
                />

                <TouchableOpacity
                  onPress={() => setStep("select")}
                  style={{ marginTop: 20 }}
                >
                  <Text
                    style={[
                      styles.link,
                      { textAlign: "center", color: c.textSecondary },
                    ]}
                  >
                    {t("common.back")}
                  </Text>
                </TouchableOpacity>
              </>
            ) : step === "phone" ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: c.text }]}>
                    {t("auth.phoneLabel")}
                  </Text>
                  <View
                    style={[styles.inputWrapper, { backgroundColor: c.input }]}
                  >
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={c.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: c.text }]}
                      value={phoneNumber}
                      onChangeText={handlePhoneChange}
                      placeholder={t("auth.phonePlaceholder")}
                      placeholderTextColor={c.textSecondary}
                      keyboardType="phone-pad"
                      maxLength={18}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <Button
                  title={t("auth.getCode")}
                  onPress={handleSendSms}
                  loading={sendSmsMutation.isPending}
                  fullWidth
                  style={{ marginTop: 8 }}
                />

                <TouchableOpacity
                  onPress={() => setStep("select")}
                  style={{ marginTop: 20 }}
                >
                  <Text
                    style={[
                      styles.link,
                      { textAlign: "center", color: c.textSecondary },
                    ]}
                  >
                    {t("common.back")}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: c.text }]}>
                    {t("auth.smsCodeLabel")}
                  </Text>
                  <TextInput
                    style={[
                      styles.codeInput,
                      {
                        backgroundColor: c.input,
                        color: c.text,
                        borderColor: c.primary,
                      },
                    ]}
                    value={code}
                    onChangeText={setCode}
                    placeholder="000000"
                    placeholderTextColor={c.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                  <Text style={[styles.hint, { color: c.textSecondary }]}>
                    {t("auth.smsCodeSentTo")} {phoneNumber}
                  </Text>
                </View>

                <Button
                  title={t("auth.login")}
                  onPress={handleVerifySms}
                  loading={verifySmsMutation.isPending}
                  fullWidth
                  style={{ marginTop: 8 }}
                />

                <TouchableOpacity
                  onPress={handleResendSms}
                  disabled={timer > 0}
                  style={styles.resendButton}
                >
                  <Text
                    style={[
                      styles.resendLink,
                      {
                        color: timer > 0 ? c.textSecondary : c.primary,
                      },
                    ]}
                  >
                    {timer > 0
                      ? t("auth.resendIn", { seconds: timer })
                      : t("auth.resendCode")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep("phone")}
                  style={styles.changeNumberButton}
                >
                  <Text style={[styles.backLink, { color: c.textSecondary }]}>
                    {t("auth.changeNumber")}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: c.textSecondary }]}>
                {t("auth.noAccount")}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={[styles.link, { color: c.primary }]}>
                  {t("auth.createAccount")}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    justifyContent: "center",
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  card: {
    borderRadius: 30,
    padding: 32,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    height: "100%",
  },
  codeInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 8,
    borderWidth: 1,
    height: 70,
  },
  hint: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 13,
  },
  resendButton: {
    marginTop: 20,
    alignItems: "center",
  },
  resendLink: {
    fontWeight: "700",
    fontSize: 14,
  },
  changeNumberButton: {
    marginTop: 12,
    alignItems: "center",
  },
  backLink: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontWeight: "800",
    fontSize: 14,
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  methodButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
