import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "../lib/theme";

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, photoUrl?: string) => void;
  isLoading?: boolean;
  chefName?: string;
  /** Текст ошибки; показывается баннером внутри модалки (тосты рисуются под Modal) */
  errorText?: string | null;
}

export default function ReviewModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
  chefName,
  errorText,
}: ReviewModalProps) {
  const c = useColors();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePickPhoto = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      const asset = result.assets[0];
      const mime = asset.mimeType ?? "image/jpeg";
      setPhoto(`data:${mime};base64,${asset.base64}`);
    }
  };

  const handleSubmit = () => {
    if (rating > 0 && comment.trim()) {
      onSubmit(rating, comment.trim(), photo ?? undefined);
    }
  };

  const handleClose = () => {
    setRating(5);
    setComment("");
    setPhoto(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <View style={[styles.modal, { backgroundColor: c.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <Text style={[styles.title, { color: c.text }]}>
              Оставить отзыв
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={c.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {!!errorText && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text style={styles.errorBannerText}>{errorText}</Text>
              </View>
            )}

            {chefName && (
              <Text style={[styles.subtitle, { color: c.textSecondary }]}>
                Отзыв для: {chefName}
              </Text>
            )}

            {/* Star Rating */}
            <Text style={[styles.label, { color: c.text }]}>Ваша оценка</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={40}
                    color={star <= rating ? "#FFD700" : c.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Input */}
            <Text style={[styles.label, { color: c.text }]}>Ваш отзыв</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: c.surface,
                  borderColor: c.border,
                  color: c.text,
                },
              ]}
              placeholder="Расскажите о вашем опыте..."
              placeholderTextColor={c.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isLoading}
            />

            {/* Photo attach — нужен для награды дегустатора */}
            <Text style={[styles.label, { color: c.text }]}>Фото блюда</Text>
            <TouchableOpacity
              style={[
                styles.photoButton,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
              onPress={handlePickPhoto}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={28} color={c.textMuted} />
                  <Text style={[styles.photoHint, { color: c.textSecondary }]}>
                    Добавьте фото — отзыв с фото и подробным описанием
                    приносит 500 коинов
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: c.primary },
                (!comment.trim() || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!comment.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Отправить отзыв</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
    paddingVertical: 8,
  },
  starButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    marginBottom: 20,
  },
  photoButton: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: 160,
  },
  photoPlaceholder: {
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  photoHint: {
    fontSize: 13,
    textAlign: "center",
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
