/**
 * Сертификация шефа: загрузка 2-5 фото кухни/блюд → ИИ-анализ → бейдж.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import { useColors } from "../lib/theme";
import { PremiumHeader, Button } from "../components/ui";
import { useSubmitCertification } from "../lib/hooks/useAiFeatures";
import type { CertificationResult } from "../lib/api/aiFeatures";

export default function CertificationScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const [photos, setPhotos] = useState<{ uri: string; mimeType: string }[]>([]);
  const [result, setResult] = useState<CertificationResult | null>(null);
  const submitMutation = useSubmitCertification();

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });
    if (!res.canceled) {
      setPhotos(
        res.assets.slice(0, 5).map((a) => ({
          uri: a.uri,
          mimeType: a.mimeType ?? "image/jpeg",
        }))
      );
    }
  };

  const handleSubmit = async () => {
    try {
      const r = await submitMutation.mutateAsync(photos);
      setResult(r);
    } catch (e: any) {
      showMessage({
        message: e?.response?.data?.message ?? t("certification.failed"),
        type: "danger",
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t("certification.title")} backButton />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.hint, { color: c.textSecondary }]}>
          {t("certification.hint")}
        </Text>

        <TouchableOpacity
          style={[
            styles.picker,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
          onPress={pickPhotos}
        >
          {photos.length ? (
            <View style={styles.photosRow}>
              {photos.map((p, i) => (
                <Image key={i} source={{ uri: p.uri }} style={styles.photo} />
              ))}
            </View>
          ) : (
            <View style={styles.pickerEmpty}>
              <Ionicons name="images-outline" size={32} color={c.textMuted} />
              <Text style={[styles.pickerText, { color: c.textSecondary }]}>
                {t("certification.pickPhotos")}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Button
          title={
            submitMutation.isPending
              ? t("certification.analyzing")
              : t("certification.submit")
          }
          onPress={handleSubmit}
          disabled={photos.length < 2 || submitMutation.isPending}
          loading={submitMutation.isPending}
          fullWidth
        />
        {photos.length > 0 && photos.length < 2 && (
          <Text style={[styles.minHint, { color: c.warning }]}>
            {t("certification.minPhotos")}
          </Text>
        )}

        {result && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: c.card,
                borderColor: result.approved ? c.success : c.error,
              },
            ]}
          >
            <Ionicons
              name={result.approved ? "shield-checkmark" : "close-circle"}
              size={40}
              color={result.approved ? c.success : c.error}
            />
            <Text
              style={[
                styles.resultTitle,
                { color: result.approved ? c.success : c.error },
              ]}
            >
              {result.approved
                ? t("certification.approved")
                : t("certification.rejected")}
            </Text>
            <View style={styles.scoresRow}>
              {[
                { label: t("certification.score"), value: result.score },
                {
                  label: t("certification.cleanliness"),
                  value: result.cleanliness,
                },
                { label: t("certification.plating"), value: result.plating },
              ].map((s) => (
                <View key={s.label} style={styles.scoreItem}>
                  <Text style={[styles.scoreValue, { color: c.text }]}>
                    {s.value}/10
                  </Text>
                  <Text style={[styles.scoreLabel, { color: c.textSecondary }]}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={[styles.verdict, { color: c.textSecondary }]}>
              {result.verdict}
            </Text>
          </View>
        )}

        <Text style={[styles.disclaimer, { color: c.textMuted }]}>
          {t("certification.disclaimer")}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 16 },
  hint: { fontSize: 14, lineHeight: 20 },
  picker: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: "center",
    padding: 12,
  },
  pickerEmpty: { alignItems: "center", gap: 8 },
  pickerText: { fontSize: 14 },
  photosRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photo: { width: 90, height: 90, borderRadius: 10 },
  minHint: { fontSize: 12, textAlign: "center" },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  resultTitle: { fontSize: 18, fontWeight: "800" },
  scoresRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignSelf: "stretch",
    marginTop: 8,
  },
  scoreItem: { alignItems: "center" },
  scoreValue: { fontSize: 16, fontWeight: "800" },
  scoreLabel: { fontSize: 12, marginTop: 2 },
  verdict: { fontSize: 13, textAlign: "center", marginTop: 8, lineHeight: 18 },
  disclaimer: { fontSize: 11, textAlign: "center" },
});
