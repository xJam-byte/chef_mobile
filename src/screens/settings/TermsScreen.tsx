import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { PremiumHeader, LegalDocumentRenderer } from "../../components/ui";
import { getCurrentLanguage } from "../../lib/i18n";
import { TERMS_OF_SERVICE } from "../../lib/legalConstants";

export default function TermsScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const lang = getCurrentLanguage() as "ru" | "en" | "kk";
  const content = TERMS_OF_SERVICE[lang] || TERMS_OF_SERVICE.en;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t("settings.termsOfService")} backButton />
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
