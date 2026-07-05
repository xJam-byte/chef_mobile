import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { useReport } from "../../lib/hooks";
import { Button } from "./Button";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  // number for users/dishes, uuid string for videos
  targetId: number | string;
  targetType: "user" | "video" | "dish";
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  targetId,
  targetType,
}) => {
  const c = useColors();
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const reportMutation = useReport();

  const handleSubmit = () => {
    if (!reason.trim()) return;

    reportMutation.mutate(
      {
        targetId,
        targetType,
        reason,
      },
      {
        onSuccess: () => {
          setReason("");
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.container, { backgroundColor: c.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.text }]}>
              {t("common.report", "Report")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: c.textMuted }]}>
            {t(
              "report.reasonTitle",
              "Please explain why you are reporting this content.",
            )}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: c.background,
                color: c.text,
                borderColor: c.border,
              },
            ]}
            multiline
            numberOfLines={4}
            placeholder={t("report.reasonPlaceholder", "Describe the issue...")}
            placeholderTextColor={c.textMuted}
            value={reason}
            onChangeText={setReason}
          />

          <Button
            title={t("common.submit", "Submit")}
            onPress={handleSubmit}
            loading={reportMutation.isPending}
            disabled={!reason.trim()}
            style={styles.submitBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  container: {
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  submitBtn: {
    width: "100%",
  },
});
