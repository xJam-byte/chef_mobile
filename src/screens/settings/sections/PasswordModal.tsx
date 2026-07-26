import React from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useColors } from "../../../lib/theme";
import { showMessage } from "react-native-flash-message";
import { translateApiError } from "../../../lib/utils/apiErrors";

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
  phone: string;
  passwordCode: string;
  setPasswordCode: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  newPassword2: string;
  setNewPassword2: (val: string) => void;
  onSubmit: () => void;
  isPendingSubmit: boolean;
  onResendCode: () => void;
  isPendingResend: boolean;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  visible,
  onClose,
  phone,
  passwordCode,
  setPasswordCode,
  newPassword,
  setNewPassword,
  newPassword2,
  setNewPassword2,
  onSubmit,
  isPendingSubmit,
  onResendCode,
  isPendingResend,
}) => {
  const c = useColors();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: c.card }]}>
          <Text style={[styles.title, { color: c.text }]}>
            {t("settings.changePassword")}
          </Text>
          <Text style={[styles.hint, { color: c.textSecondary }]}>
            {t(
              "settings.passwordCodeHint",
              "Мы отправили SMS-код на ваш номер {{phone}}. Введите его и новый пароль.",
              { phone: phone }
            )}
          </Text>

          <Text style={[styles.label, { color: c.textSecondary }]}>
            {t("auth.smsCodeLabel", "Код из SMS")}
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: c.input, borderColor: c.border }]}>
            <TextInput
              style={[styles.input, { color: c.text }]}
              value={passwordCode}
              onChangeText={setPasswordCode}
              placeholder="000000"
              placeholderTextColor={c.textMuted}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <Text style={[styles.label, { color: c.textSecondary }]}>
            {t("settings.newPassword", "Новый пароль")}
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: c.input, borderColor: c.border }]}>
            <TextInput
              style={[styles.input, { color: c.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="••••••"
              placeholderTextColor={c.textMuted}
            />
          </View>

          <Text style={[styles.label, { color: c.textSecondary }]}>
            {t("settings.repeatPassword", "Повторите пароль")}
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: c.input, borderColor: c.border }]}>
            <TextInput
              style={[styles.input, { color: c.text }]}
              value={newPassword2}
              onChangeText={setNewPassword2}
              secureTextEntry
              placeholder="••••••"
              placeholderTextColor={c.textMuted}
            />
          </View>

          <TouchableOpacity
            onPress={onResendCode}
            disabled={isPendingResend}
            style={{ marginBottom: 16 }}
          >
            <Text style={{ color: c.primary, fontWeight: "600", fontSize: 13 }}>
              {t("auth.resendCode", "Отправить код повторно")}
            </Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: c.input }]}
              onPress={onClose}
            >
              <Text style={{ color: c.text, fontWeight: "600" }}>
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: c.primary }]}
              onPress={onSubmit}
              disabled={isPendingSubmit}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {isPendingSubmit ? t("common.loading") : t("common.save", "Сохранить")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
    paddingVertical: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
