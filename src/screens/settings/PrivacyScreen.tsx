import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { PremiumHeader, LegalDocumentRenderer } from "../../components/ui";
import { getCurrentLanguage } from "../../lib/i18n";
import { PRIVACY_POLICY } from "../../lib/legalConstants";

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const lang = getCurrentLanguage() as "ru" | "en" | "kk";
  const content = PRIVACY_POLICY[lang] || PRIVACY_POLICY.en;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t("settings.privacyPolicy")} backButton />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LegalDocumentRenderer content={content} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
});
