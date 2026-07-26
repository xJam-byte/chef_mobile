import React from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useColors } from "../../../lib/theme";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  nameInput: string;
  setNameInput: (val: string) => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  emailCodeSent: boolean;
  emailCode: string;
  setEmailCode: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
  originalEmail: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  nameInput,
  setNameInput,
  emailInput,
  setEmailInput,
  emailCodeSent,
  emailCode,
  setEmailCode,
  onSave,
  isSaving,
  originalEmail,
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
            {t("settings.personalData", "Личные данные")}
          </Text>

          <Text style={[styles.label, { color: c.textSecondary }]}>
            {t("auth.nameLabel", "Имя")}
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: c.input, borderColor: c.border }]}>
            <TextInput
              style={[styles.input, { color: c.text }]}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder={t("auth.namePlaceholder", "Ваше имя")}
              placeholderTextColor={c.textMuted}
            />
          </View>

          <Text style={[styles.label, { color: c.textSecondary }]}>
            Email
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: c.input, borderColor: c.border }]}>
            <TextInput
              style={[styles.input, { color: c.text }]}
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="you@example.com"
              placeholderTextColor={c.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {emailCodeSent && (
            <>
              <Text style={[styles.label, { color: c.textSecondary }]}>
                {t("settings.emailCodeLabel", "Код с новой почты")}
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: c.input, borderColor: c.primary }]}>
                <TextInput
                  style={[styles.input, { color: c.text }]}
                  value={emailCode}
                  onChangeText={setEmailCode}
                  placeholder="000000"
                  placeholderTextColor={c.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>
            </>
          )}

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
              onPress={onSave}
              disabled={isSaving}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {isSaving
                  ? t("common.loading")
                  : emailInput.trim().toLowerCase() !== originalEmail &&
                    emailInput.trim() &&
                    !emailCodeSent
                  ? t("auth.getCode", "Получить код")
                  : t("common.save", "Сохранить")}
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
