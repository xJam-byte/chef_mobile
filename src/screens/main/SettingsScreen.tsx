import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors, useTheme, ThemeName } from "../../lib/theme";
import {
  useLogout,
  useProfile,
  useSendPasswordCode,
  useChangePasswordWithCode,
  useSendEmailChangeCode,
  useConfirmEmailChange,
} from "../../lib/hooks";
import {
  useDeleteAccount,
  useUpdateContacts,
} from "../../lib/hooks/useUser";
import { translateApiError } from "../../lib/utils/apiErrors";
import { changeLanguage, getCurrentLanguage } from "../../lib/i18n";
import {
  PremiumHeader,
  SelectionModal,
  SelectionOption,
} from "../../components/ui";
import { showMessage } from "react-native-flash-message";
import { UsernameModal } from "../settings/sections/UsernameModal";
import { PasswordModal } from "../settings/sections/PasswordModal";
import { ProfileModal } from "../settings/sections/ProfileModal";

export default function SettingsScreen({ navigation }: any) {
  const c = useColors();
  const { t } = useTranslation();
  const { themeName, setTheme } = useTheme();
  const logoutMutation = useLogout();
  const deleteAccountMutation = useDeleteAccount();

  const [language, setLanguage] = useState<"ru" | "en" | "kk">("ru");
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  // Смена @username
  const { data: profile } = useProfile();
  const updateContactsMutation = useUpdateContacts();
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");

  const openUsernameModal = () => {
    setUsernameInput(profile?.username ?? "");
    setUsernameModalVisible(true);
  };

  const handleSaveUsername = () => {
    const username = usernameInput.trim().toLowerCase().replace(/^@/, "");
    if (!/^[a-z0-9_]{3,32}$/.test(username)) {
      showMessage({
        message: t("settings.usernameInvalid",
          "Юзернейм: 3–32 символа, только a-z, 0-9 и _"),
        type: "warning",
        icon: "warning",
      });
      return;
    }
    updateContactsMutation.mutate(
      { email: profile?.email ?? "", username },
      {
        onSuccess: () => {
          setUsernameModalVisible(false);
          showMessage({
            message: t("settings.usernameSaved", "Юзернейм обновлён"),
            type: "success",
            icon: "success",
          });
        },
        onError: (e) => {
          showMessage({
            message: t("common.error"),
            description: translateApiError(e),
            type: "danger",
            icon: "danger",
          });
        },
      },
    );
  };

  // Notification toggles (mock)
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  // Load current language on mount
  useEffect(() => {
    const currentLang = getCurrentLanguage() as "ru" | "en" | "kk";
    setLanguage(currentLang);
  }, []);

  const handleThemeSelect = (value: string) => {
    setTheme(value as ThemeName);
  };

  // Двойное подтверждение: удаление необратимо
  const handleDeleteAccount = () => {
    Alert.alert(
      t("settings.deleteAccount"),
      t("settings.deleteAccountWarning"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.deleteAccountContinue"),
          style: "destructive",
          onPress: () =>
            Alert.alert(
              t("settings.deleteAccountConfirmTitle"),
              t("settings.deleteAccountConfirmText"),
              [
                { text: t("common.cancel"), style: "cancel" },
                {
                  text: t("settings.deleteAccountFinal"),
                  style: "destructive",
                  onPress: () =>
                    deleteAccountMutation.mutate(undefined, {
                      onError: (e: any) => {
                        const data = e?.response?.data;
                        showMessage({
                          message:
                            data?.code === "active_orders"
                              ? t("settings.deleteAccountActiveOrders")
                              : (data?.message ?? t("common.error")),
                          type: "danger",
                        });
                      },
                    }),
                },
              ],
            ),
        },
      ],
    );
  };

  const handleLanguageSelect = (value: string) => {
    const newLang = value as "ru" | "en" | "kk";
    setLanguage(newLang);
    changeLanguage(newLang);
  };

  const togglePush = () => {
    setPushEnabled(!pushEnabled);
    showMessage({
      message: t("settings.notificationsSaved"),
      type: "success",
      backgroundColor: c.success,
    });
  };

  const toggleEmail = () => {
    setEmailEnabled(!emailEnabled);
    showMessage({
      message: t("settings.notificationsSaved"),
      type: "success",
      backgroundColor: c.success,
    });
  };

  // ===== Личные данные (имя + почта; смена почты — с кодом на новую почту) =====
  const sendEmailChangeCodeMutation = useSendEmailChangeCode();
  const confirmEmailChangeMutation = useConfirmEmailChange();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState("");

  const openProfileModal = () => {
    setNameInput(profile?.name ?? "");
    setEmailInput(profile?.email ?? "");
    setEmailCodeSent(false);
    setEmailCode("");
    setProfileModalVisible(true);
  };

  const profileSaving =
    updateContactsMutation.isPending ||
    sendEmailChangeCodeMutation.isPending ||
    confirmEmailChangeMutation.isPending;

  const handleSaveProfile = async () => {
    const name = nameInput.trim();
    const emailNew = emailInput.trim().toLowerCase();
    const emailChanged = !!emailNew && emailNew !== (profile?.email ?? "");

    if (!name) {
      showMessage({
        message: t("settings.nameRequired", "Введите имя"),
        type: "warning",
        icon: "warning",
      });
      return;
    }
    if (emailChanged && !/^\S+@\S+\.\S+$/.test(emailNew)) {
      showMessage({
        message: t("settings.emailInvalid", "Некорректная почта"),
        type: "warning",
        icon: "warning",
      });
      return;
    }

    try {
      if (name !== profile?.name) {
        await updateContactsMutation.mutateAsync({
          email: profile?.email ?? "",
          name,
        });
      }

      if (emailChanged && !emailCodeSent) {
        // Шаг 1: отправляем код на НОВУЮ почту, форма ждёт код
        await sendEmailChangeCodeMutation.mutateAsync(emailNew);
        setEmailCodeSent(true);
        showMessage({
          message: t("settings.emailCodeSentTo", "Код отправлен на {{email}}", {
            email: emailNew,
          }),
          type: "success",
          icon: "success",
        });
        return;
      }

      if (emailChanged && emailCodeSent) {
        // Шаг 2: подтверждаем код
        if (emailCode.trim().length !== 6) {
          showMessage({
            message: t("auth.errorInvalidCode"),
            type: "warning",
            icon: "warning",
          });
          return;
        }
        await confirmEmailChangeMutation.mutateAsync({
          newEmail: emailNew,
          code: emailCode.trim(),
        });
      }

      setProfileModalVisible(false);
      showMessage({
        message: t("settings.profileSaved", "Данные обновлены"),
        type: "success",
        icon: "success",
      });
    } catch (e) {
      showMessage({
        message: t("common.error"),
        description: translateApiError(e),
        type: "danger",
        icon: "danger",
      });
    }
  };

  // ===== Смена пароля: SMS-код → новый пароль =====
  const sendPasswordCodeMutation = useSendPasswordCode();
  const changePasswordMutation = useChangePasswordWithCode();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordCode, setPasswordCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");

  const handleChangePassword = () => {
    setPasswordCode("");
    setNewPassword("");
    setNewPassword2("");
    setPasswordModalVisible(true);
    // Код уходит сразу при открытии модалки
    sendPasswordCodeMutation.mutate(undefined, {
      onError: (e) => {
        showMessage({
          message: t("common.error"),
          description: translateApiError(e),
          type: "danger",
          icon: "danger",
        });
      },
    });
  };

  const handleSubmitPassword = () => {
    if (passwordCode.length !== 6) {
      showMessage({
        message: t("auth.errorInvalidCode"),
        type: "warning",
        icon: "warning",
      });
      return;
    }
    if (newPassword.length < 6) {
      showMessage({
        message: t("settings.passwordTooShort",
          "Пароль должен быть не короче 6 символов"),
        type: "warning",
        icon: "warning",
      });
      return;
    }
    if (newPassword !== newPassword2) {
      showMessage({
        message: t("settings.passwordsDontMatch", "Пароли не совпадают"),
        type: "warning",
        icon: "warning",
      });
      return;
    }
    changePasswordMutation.mutate(
      { code: passwordCode.trim(), new_password: newPassword },
      {
        onSuccess: () => {
          setPasswordModalVisible(false);
          showMessage({
            message: t("settings.changePasswordSuccess", "Пароль успешно изменён"),
            type: "success",
            icon: "success",
          });
        },
        onError: (e) => {
          showMessage({
            message: t("common.error"),
            description: translateApiError(e),
            type: "danger",
            icon: "danger",
          });
        },
      },
    );
  };

  const handleLogout = () => {
    Alert.alert(t("settings.logout"), t("settings.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logout"),
        style: "destructive",
        onPress: () => logoutMutation.mutate(),
      },
    ]);
  };

  const SettingRow = ({
    icon,
    title,
    value,
    onPress,
    iconColor,
    rightElement,
  }: {
    icon: any;
    title: string;
    value?: string;
    onPress?: () => void;
    iconColor?: string;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: c.divider }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: iconColor || c.primary + "20" },
          ]}
        >
          <Ionicons name={icon} size={20} color={iconColor || c.primary} />
        </View>
        <Text style={[styles.rowTitle, { color: c.text }]}>{title}</Text>
      </View>
      <View style={styles.rowRight}>
        {value && (
          <Text
            style={[styles.rowValue, { color: c.textMuted }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {value}
          </Text>
        )}
        {rightElement ||
          (onPress && (
            <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
          ))}
      </View>
    </TouchableOpacity>
  );

  const getLanguageName = () => {
    if (language === "ru") return "Русский";
    if (language === "en") return "English";
    return "Қазақша";
  };

  const getThemeName = () => {
    if (themeName === "light") return t("settings.light");
    if (themeName === "dark") return t("settings.dark");
    return t("settings.system");
  };

  const themeOptions: SelectionOption[] = [
    { label: t("settings.light"), value: "light", icon: "sunny" },
    { label: t("settings.dark"), value: "dark", icon: "moon" },
    { label: t("settings.system"), value: "system", icon: "settings-outline" },
  ];

  const languageOptions: SelectionOption[] = [
    { label: "Русский", value: "ru", icon: "globe" },
    { label: "English", value: "en", icon: "globe" },
    { label: "Қазақша", value: "kk", icon: "globe" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t("settings.title", "Settings")} backButton />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            {t("settings.appearance")}
          </Text>

          <SettingRow
            icon="color-palette"
            title={t("settings.theme")}
            value={getThemeName()}
            onPress={() => setThemeModalVisible(true)}
          />

          <SettingRow
            icon="language"
            title={t("settings.language")}
            value={getLanguageName()}
            onPress={() => setLangModalVisible(true)}
          />
        </View>

        {/* Rewards Section */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            {t("settings.rewards")}
          </Text>

          <SettingRow
            icon="wallet"
            title={t("wallet.title")}
            onPress={() => navigation.navigate("Wallet")}
          />

          <SettingRow
            icon="gift"
            title={t("referral.title")}
            onPress={() => navigation.navigate("Referral")}
          />
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            {t("settings.notifications")}
          </Text>

          <SettingRow
            icon="notifications"
            title={t("settings.pushNotifications")}
            rightElement={
              <Switch
                value={pushEnabled}
                onValueChange={togglePush}
                trackColor={{ false: c.border, true: c.primary }}
                thumbColor={"#fff"}
                ios_backgroundColor={c.border}
              />
            }
          />

          <SettingRow
            icon="mail"
            title={t("settings.emailNotifications")}
            rightElement={
              <Switch
                value={emailEnabled}
                onValueChange={toggleEmail}
                trackColor={{ false: c.border, true: c.primary }}
                thumbColor={"#fff"}
                ios_backgroundColor={c.border}
              />
            }
          />
        </View>

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            {t("settings.account")}
          </Text>

          <SettingRow
            icon="person-circle"
            title={t("settings.personalData", "Личные данные")}
            value={profile?.email || profile?.name || ""}
            onPress={openProfileModal}
          />

          <SettingRow
            icon="at"
            title={t("settings.username", "Юзернейм")}
            value={profile?.username ? `@${profile.username}` : "—"}
            onPress={openUsernameModal}
          />

          <SettingRow
            icon="lock-closed"
            title={t("settings.changePassword")}
            onPress={handleChangePassword}
          />

          <SettingRow
            icon="shield-checkmark"
            title={t("settings.security")}
            onPress={() =>
              Alert.alert(t("settings.security"), t("settings.comingSoon"))
            }
          />

          <SettingRow
            icon="chatbubble-ellipses"
            title={t("settings.support", "Support")}
            onPress={() => navigation.navigate("Support")}
          />
        </View>

        {/* Addresses Section */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            {t("settings.addresses")}
          </Text>

          <SettingRow
            icon="location"
            title={t("settings.myAddresses")}
            onPress={() => navigation.navigate("AddressManagement")}
          />
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: c.card }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            {t("settings.about")}
          </Text>

          <SettingRow
            icon="information-circle"
            title={t("settings.version")}
            value="1.0.0"
          />

          <SettingRow
            icon="document-text"
            title={t("settings.termsOfService")}
            onPress={() => navigation.navigate("Terms")}
          />

          <SettingRow
            icon="shield"
            title={t("settings.privacyPolicy")}
            onPress={() => navigation.navigate("Privacy")}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            { backgroundColor: c.error + "15", borderColor: c.error },
          ]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={c.error} />
          <Text style={[styles.logoutText, { color: c.error }]}>
            {t("settings.logout")}
          </Text>
        </TouchableOpacity>

        {/* Удаление аккаунта — обязательный пункт App Store 5.1.1(v) */}
        <TouchableOpacity
          style={styles.deleteAccountBtn}
          onPress={handleDeleteAccount}
          disabled={deleteAccountMutation.isPending}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={c.textMuted} />
          <Text style={[styles.deleteAccountText, { color: c.textMuted }]}>
            {deleteAccountMutation.isPending
              ? t("settings.deletingAccount")
              : t("settings.deleteAccount")}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
      <SelectionModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        title={t("settings.selectTheme")}
        options={themeOptions}
        selectedValue={themeName}
        onSelect={handleThemeSelect}
      />

      <SelectionModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
        title={t("settings.selectLanguage")}
        options={languageOptions}
        selectedValue={language}
        onSelect={handleLanguageSelect}
      />

      {/* Модалка «Личные данные»: имя + почта */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        nameInput={nameInput}
        setNameInput={setNameInput}
        emailInput={emailInput}
        setEmailInput={(v: string) => {
          setEmailInput(v);
          setEmailCodeSent(false);
          setEmailCode("");
        }}
        emailCodeSent={emailCodeSent}
        emailCode={emailCode}
        setEmailCode={setEmailCode}
        onSave={handleSaveProfile}
        isSaving={profileSaving}
        originalEmail={profile?.email ?? ""}
      />

      {/* Модалка смены пароля: SMS-код → новый пароль */}
      <PasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        phone={profile?.phone_number ?? ""}
        passwordCode={passwordCode}
        setPasswordCode={setPasswordCode}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        newPassword2={newPassword2}
        setNewPassword2={setNewPassword2}
        onSubmit={handleSubmitPassword}
        isPendingSubmit={changePasswordMutation.isPending}
        onResendCode={() =>
          sendPasswordCodeMutation.mutate(undefined, {
            onSuccess: () =>
              showMessage({
                message: t("auth.successSmsSent", "Код отправлен"),
                type: "success",
                icon: "success",
              }),
            onError: (e) =>
              showMessage({
                message: t("common.error"),
                description: translateApiError(e),
                type: "danger",
                icon: "danger",
              }),
          })
        }
        isPendingResend={sendPasswordCodeMutation.isPending}
      />

      {/* Модалка смены @username */}
      <UsernameModal
        visible={usernameModalVisible}
        onClose={() => setUsernameModalVisible(false)}
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
        onSave={handleSaveUsername}
        isPending={updateContactsMutation.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  usernameBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  usernameCard: {
    borderRadius: 20,
    padding: 20,
  },
  usernameTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  usernameHint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  usernameInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  usernameInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
    paddingVertical: 0,
  },
  usernameActions: {
    flexDirection: "row",
    gap: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  usernameBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    padding: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "flex-end",
    marginLeft: 12,
  },
  rowValue: {
    fontSize: 14,
    flexShrink: 1,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
  },
  deleteAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 12,
  },
  deleteAccountText: {
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  bottomPadding: {
    height: 32,
  },
});
