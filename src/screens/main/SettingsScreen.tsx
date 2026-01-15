import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors, useTheme } from "../../lib/theme";
import { useLogout } from "../../lib/hooks";
import { changeLanguage, getCurrentLanguage } from "../../lib/i18n";

export default function SettingsScreen({ navigation }: any) {
    const c = useColors();
    const { t } = useTranslation();
    const { themeName, toggleTheme } = useTheme();
    const logoutMutation = useLogout();

    const [language, setLanguage] = React.useState<"ru" | "en" | "kk">("ru");

    // Load current language on mount
    useEffect(() => {
        const currentLang = getCurrentLanguage() as "ru" | "en" | "kk";
        setLanguage(currentLang);
    }, []);

    const handleLanguageChange = () => {
        let newLang: "ru" | "en" | "kk";
        if (language === "ru") newLang = "en";
        else if (language === "en") newLang = "kk";
        else newLang = "ru";

        setLanguage(newLang);
        changeLanguage(newLang);
    };

    const handleLogout = () => {
        Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
            { text: t('common.cancel'), style: "cancel" },
            {
                text: t('settings.logout'),
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
    }: {
        icon: any;
        title: string;
        value?: string;
        onPress: () => void;
        iconColor?: string;
    }) => (
        <TouchableOpacity
            style={[styles.row, { borderBottomColor: c.divider }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.iconCircle, { backgroundColor: iconColor || c.primary + "20" }]}>
                    <Ionicons name={icon} size={20} color={iconColor || c.primary} />
                </View>
                <Text style={[styles.rowTitle, { color: c.text }]}>{title}</Text>
            </View>
            <View style={styles.rowRight}>
                {value && <Text style={[styles.rowValue, { color: c.textMuted }]}>{value}</Text>}
                <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
            </View>
        </TouchableOpacity>
    );

    const getLanguageName = () => {
        if (language === "ru") return "Русский";
        if (language === "en") return "English";
        return "Қазақша";
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: c.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Appearance Section */}
            <View style={[styles.section, { backgroundColor: c.card }]}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.appearance')}</Text>

                <SettingRow
                    icon={themeName === "dark" ? "moon" : "sunny"}
                    title={t('settings.theme')}
                    value={themeName === "dark" ? t('settings.dark') : t('settings.light')}
                    onPress={toggleTheme}
                />

                <SettingRow
                    icon="language"
                    title={t('settings.language')}
                    value={getLanguageName()}
                    onPress={handleLanguageChange}
                />
            </View>

            {/* Notifications Section */}
            <View style={[styles.section, { backgroundColor: c.card }]}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.notifications')}</Text>

                <SettingRow
                    icon="notifications"
                    title={t('settings.pushNotifications')}
                    value={t('settings.enabled')}
                    onPress={() => Alert.alert(t('settings.pushNotifications'), t('settings.comingSoon'))}
                />

                <SettingRow
                    icon="mail"
                    title={t('settings.emailNotifications')}
                    value={t('settings.disabled')}
                    onPress={() => Alert.alert(t('settings.emailNotifications'), t('settings.comingSoon'))}
                />
            </View>

            {/* Account Section */}
            <View style={[styles.section, { backgroundColor: c.card }]}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.account')}</Text>

                <SettingRow
                    icon="lock-closed"
                    title={t('settings.changePassword')}
                    onPress={() => Alert.alert(t('settings.changePassword'), t('settings.comingSoon'))}
                />

                <SettingRow
                    icon="shield-checkmark"
                    title={t('settings.security')}
                    onPress={() => Alert.alert(t('settings.security'), t('settings.comingSoon'))}
                />
            </View>

            {/* Addresses Section */}
            <View style={[styles.section, { backgroundColor: c.card }]}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.addresses')}</Text>

                <SettingRow
                    icon="location"
                    title={t('settings.myAddresses')}
                    onPress={() => navigation.navigate("AddressManagement")}
                />
            </View>

            {/* About Section */}
            <View style={[styles.section, { backgroundColor: c.card }]}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>{t('settings.about')}</Text>

                <SettingRow
                    icon="information-circle"
                    title={t('settings.version')}
                    value="1.0.0"
                    onPress={() => { }}
                />

                <SettingRow
                    icon="document-text"
                    title={t('settings.termsOfService')}
                    onPress={() => Alert.alert(t('settings.termsOfService'), t('settings.comingSoon'))}
                />

                <SettingRow
                    icon="shield"
                    title={t('settings.privacyPolicy')}
                    onPress={() => Alert.alert(t('settings.privacyPolicy'), t('settings.comingSoon'))}
                />
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={[styles.logoutBtn, { backgroundColor: c.error + "15", borderColor: c.error }]}
                onPress={handleLogout}
                activeOpacity={0.7}
            >
                <Ionicons name="log-out-outline" size={20} color={c.error} />
                <Text style={[styles.logoutText, { color: c.error }]}>{t('settings.logout')}</Text>
            </TouchableOpacity>

            <View style={styles.bottomPadding} />
        </ScrollView>
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
