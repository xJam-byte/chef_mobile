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
import { useRegister, useVerifySms } from "../../lib/hooks";
import type { AuthScreenProps } from "../../navigation/types";
import { useColors } from "../../lib/theme";
import type { UserRole } from "../../lib/types";

const RegisterScreen = ({ navigation }: AuthScreenProps<"Register">) => {
  const c = useColors();
  const { t } = useTranslation();

  const registerMutation = useRegister();
  const verifySmsMutation = useVerifySms();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");

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

  const handleRegister = async () => {
    try {
      const rawPhone = getRawPhoneNumber(phoneNumber);
      
      if (rawPhone.length < 12) {
        Alert.alert(t('common.error'), t('auth.errorInvalidPhone'));
        return;
      }

      if (!name) {
        Alert.alert(t('common.error'), t('auth.errorNameRequired'));
        return;
      }

      if (!password) {
        Alert.alert(t('common.error'), t('auth.errorPasswordRequired'));
        return;
      }

      await registerMutation.mutateAsync({
        name: name.trim(),
        phone_number: rawPhone,
        email: email.trim() || undefined,
        password: password.trim(),
        role: selectedRole,
      });
      
      // Move to verification step
      setStep("verify");
      Alert.alert(t('common.success'), t('auth.successSmsSent'));
      
    } catch (e: any) {
      const msgRaw = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message;

      const msg =
        Array.isArray(msgRaw) ? msgRaw.join("\n") :
          typeof msgRaw === "string" ? msgRaw :
            JSON.stringify(e?.response?.data ?? {}, null, 2);

      Alert.alert(t('auth.errorRegistration'), msg);
    }
  };

  const handleVerify = async () => {
    try {
      const rawPhone = getRawPhoneNumber(phoneNumber);
      if (code.length !== 6) {
        Alert.alert(t('common.error'), t('auth.errorInvalidCode'));
        return;
      }

      await verifySmsMutation.mutateAsync({
         phone_number: rawPhone,
         code: code
      });
      
      // Navigation is handled by RootNavigator/AuthState
    } catch (e: any) {
       Alert.alert(t('common.error'), e?.response?.data?.message || t('auth.errorInvalidSmsCode'));
    }
  }

  const RoleCard = ({ role, title, icon, description }: { role: UserRole, title: string, icon: any, description: string }) => {
    const isSelected = selectedRole === role;
    return (
      <TouchableOpacity 
        style={[
          styles.roleCard, 
          { 
            backgroundColor: isSelected ? c.primary + '15' : c.input,
            borderColor: isSelected ? c.primary : 'transparent',
            borderWidth: 2,
          }
        ]}
        onPress={() => setSelectedRole(role)}
        activeOpacity={0.7}
      >
        <View style={[styles.roleIcon, { backgroundColor: isSelected ? c.primary : c.textSecondary + '20' }]}>
          <Ionicons name={icon} size={24} color={isSelected ? '#fff' : c.textSecondary} />
        </View>
        <View style={styles.roleContent}>
          <Text style={[styles.roleTitle, { color: isSelected ? c.primary : c.text }]}>{title}</Text>
          <Text style={[styles.roleDesc, { color: c.textSecondary }]}>{description}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark-circle" size={24} color={c.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
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
            
            <Animated.Text 
              style={[
                styles.title, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              {t('auth.createAccount')}
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.subtitle, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              {t('auth.subtitleJoin')}
            </Animated.Text>
          </View>

          <Animated.View 
            style={[
              styles.card, 
              { 
                backgroundColor: c.authCard,
                borderColor: c.authCardBorder,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Role Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: c.text }]}>{t('roleSelection.chooseRole')}</Text>
              <View style={styles.rolesContainer}>
                <RoleCard 
                  role="customer" 
                  title={t('roleSelection.customer')} 
                  icon="person"
                  description={t('roleSelection.customerDescriptionShort') || "Order food"}
                />
                <RoleCard 
                  role="chef" 
                  title={t('roleSelection.chef')} 
                  icon="restaurant"
                  description={t('roleSelection.chefDescriptionShort') || "Cook & sell"}
                />
              </View>
            </View>

            {step === "form" ? (
              <>
                <View style={styles.form}>
                  {/* Name */}
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: c.text }]}>{t('auth.nameLabel')}</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: c.input }]}>
                      <Ionicons name="person-outline" size={20} color={c.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: c.text }]}
                        value={name}
                        onChangeText={setName}
                        placeholder={t('auth.namePlaceholder')}
                        placeholderTextColor={c.textSecondary}
                      />
                    </View>
                  </View>

                  {/* Phone */}
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: c.text }]}>{t('auth.phoneRequired')}</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: c.input }]}>
                      <Ionicons name="call-outline" size={20} color={c.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: c.text }]}
                        value={phoneNumber}
                        onChangeText={handlePhoneChange}
                        placeholder={t('auth.phonePlaceholder')}
                        placeholderTextColor={c.textSecondary}
                        keyboardType="phone-pad"
                        maxLength={18}
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: c.text }]}>{t('auth.emailOptional')}</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: c.input }]}>
                      <Ionicons name="mail-outline" size={20} color={c.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: c.text }]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('auth.emailPlaceholder')}
                        placeholderTextColor={c.textSecondary}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: c.text }]}>{t('auth.passwordLabel')}</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: c.input }]}>
                      <Ionicons name="lock-closed-outline" size={20} color={c.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: c.text }]}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder={t('auth.passwordPlaceholder')}
                        placeholderTextColor={c.textSecondary}
                      />
                    </View>
                  </View>
                </View>

                <Button
                  title={t('auth.registerButton')}
                  onPress={handleRegister}
                  loading={registerMutation.isPending}
                  fullWidth
                  style={{ marginTop: 12 }}
                />
              </>
            ) : (
               <>
                <View style={[styles.inputContainer, { alignItems: 'center', marginVertical: 20 }]}>
                  <Text style={[styles.label, { color: c.text, textAlign: 'center' }]}>
                    {t('auth.enterSmsCode')}
                  </Text>
                  <Text style={{ color: c.textSecondary, marginBottom: 20 }}>
                    {t('auth.smsCodeSentTo')} {phoneNumber}
                  </Text>
                  
                  <TextInput
                    style={[
                      styles.codeInput,
                      { 
                        backgroundColor: c.input, 
                        color: c.text,
                        borderColor: c.primary 
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
                </View>

                <Button
                  title={t('auth.verifyButton') || "Verify"}
                  onPress={handleVerify}
                  loading={verifySmsMutation.isPending}
                  fullWidth
                />
                
                <TouchableOpacity onPress={() => setStep("form")} style={{ marginTop: 20 }}>
                    <Text style={[styles.link, { textAlign: 'center', color: c.textSecondary }]}>
                        {t('common.cancel')}
                    </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: c.textSecondary }]}>
                {t('auth.alreadyHaveAccount')}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.link, { color: c.primary }]}>
                  {t('auth.loginLink')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
    position: 'relative',
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  card: { 
    borderRadius: 30, 
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  section: {
    marginBottom: 24,
  },
  rolesContainer: {
    gap: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 13,
  },
  checkIcon: {
    marginLeft: 8,
  },
  form: {
    gap: 0,
  },
  inputContainer: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  link: { 
    fontWeight: "800",
    fontSize: 14,
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
    width: '100%',
  },
});
