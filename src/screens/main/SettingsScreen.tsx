import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors, useTheme, ThemeName } from "../../lib/theme";
import { useLogout } from "../../lib/hooks";
import { changeLanguage, getCurrentLanguage } from "../../lib/i18n";
import {
  PremiumHeader,
  SelectionModal,
  SelectionOption,
} from "../../components/ui";
import { showMessage } from "react-native-flash-message";

export default function SettingsScreen({ navigation }: any) {
  const c = useColors();
  const { t } = useTranslation();
  const { themeName, setTheme } = useTheme();
  const logoutMutation = useLogout();

  const [language, setLanguage] = useState<"ru" | "en" | "kk">("ru");
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

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

  const handleChangePassword = () => {
    Alert.alert(
      t("settings.changePassword"),
      t("settings.changePasswordSuccess"),
      [{ text: "OK" }],
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
          <Text style={[styles.rowValue, { color: c.textMuted }]}>{value}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: 1,
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
  },
  rowValue: {
    fontSize: 14,
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
  bottomPadding: {
    height: 32,
  },
});
