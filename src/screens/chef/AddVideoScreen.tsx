/**
 * Add Video Screen - Upload videos linked to dishes
 * FULLY IMPLEMENTED
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "../../lib/theme";
import { useProfile, useChefDishes, useCreateVideo } from "../../lib/hooks";
import { useChefByUserId } from "../../lib/hooks/useChefs";
import { showMessage } from "react-native-flash-message";

export default function AddVideoScreen({ navigation }: any) {
  const c = useColors();
  const { data: profile } = useProfile();
  const { data: chef } = useChefByUserId(profile?.user_id);
  const chefId = chef?.chef_id;
  
  const { data: dishesData } = useChefDishes(chefId);
  const dishes = dishesData?.data || [];

  const createVideoMutation = useCreateVideo();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [showDishPicker, setShowDishPicker] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      showMessage({ message: "Введите название видео", type: "warning" });
      return;
    }

    if (!videoUri) {
      showMessage({ message: "Выберите видео", type: "warning" });
      return;
    }

    if (!chefId) {
      showMessage({ message: "Профиль шефа не найден", type: "danger" });
      return;
    }

    try {
      await createVideoMutation.mutateAsync({
        videoUri,
        description: description.trim() || undefined,
        dishId: selectedDishId || undefined,
      });

      showMessage({ message: "Видео успешно загружено!", type: "success" });
      
      // Reset form
      setTitle("");
      setDescription("");
      setSelectedDishId(null);
      setVideoUri(null);
      
      navigation.goBack();
    } catch (error: any) {
      showMessage({
        message: error?.message || "Ошибка при загрузке видео",
        type: "danger",
      });
    }
  };

  const handleVideoPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Нет разрешения", "Необходимо разрешение для доступа к галерее");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setVideoUri(result.assets[0].uri);
        showMessage({ message: "Видео выбрано", type: "success" });
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось выбрать видео");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Video Upload Section */}
        <TouchableOpacity
          style={[
            styles.videoSection,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
          onPress={handleVideoPick}
          activeOpacity={0.8}
          disabled={createVideoMutation.isPending}
        >
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam" size={64} color={c.textMuted} />
            <Text style={[styles.videoPlaceholderText, { color: c.text }]}>
              {videoUri ? "Видео выбрано ✓" : "Выбрать видео"}
            </Text>
            {videoUri && (
              <Ionicons name="checkmark-circle" size={32} color={c.primary} />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.text }]}>
              Название видео <Text style={{ color: c.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: c.surface, color: c.text, borderColor: c.border },
              ]}
              placeholder="Например: Как приготовить плов"
              placeholderTextColor={c.textMuted}
              value={title}
              onChangeText={setTitle}
              editable={!createVideoMutation.isPending}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.text }]}>Описание</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: c.surface, color: c.text, borderColor: c.border },
              ]}
              placeholder="Расскажите о видео..."
              placeholderTextColor={c.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!createVideoMutation.isPending}
            />
          </View>

          {/* Select Dish */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.text }]}>
              Привязать к блюду (опционально)
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
              onPress={() => setShowDishPicker(true)}
              activeOpacity={0.7}
              disabled={createVideoMutation.isPending || dishes.length === 0}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  { color: selectedDishId ? c.text : c.textMuted },
                ]}
              >
                {selectedDishId
                  ? dishes.find((d: any) => d.dish_id === selectedDishId)?.name ||
                    "Блюдо не найдено"
                  : dishes.length === 0
                  ? "Нет доступных блюд"
                  : "Выберите блюдо"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={c.textMuted} />
            </TouchableOpacity>

            <Modal
              visible={showDishPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDishPicker(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowDishPicker(false)}
              >
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: c.card, borderColor: c.border },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: c.text }]}>
                      Выберите блюдо
                    </Text>
                    <TouchableOpacity onPress={() => setShowDishPicker(false)}>
                      <Ionicons name="close" size={24} color={c.text} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalList}>
                    <TouchableOpacity
                      style={[
                        styles.modalItem,
                        selectedDishId === null && { backgroundColor: c.primary + "15" },
                      ]}
                      onPress={() => {
                        setSelectedDishId(null);
                        setShowDishPicker(false);
                      }}
                    >
                      <Text style={[styles.modalItemText, { color: c.text }]}>
                        Без блюда
                      </Text>
                      {selectedDishId === null && (
                        <Ionicons name="checkmark" size={20} color={c.primary} />
                      )}
                    </TouchableOpacity>
                    {dishes.map((dish: any) => (
                      <TouchableOpacity
                        key={dish.dish_id}
                        style={[
                          styles.modalItem,
                          selectedDishId === dish.dish_id && {
                            backgroundColor: c.primary + "15",
                          },
                        ]}
                        onPress={() => {
                          setSelectedDishId(dish.dish_id);
                          setShowDishPicker(false);
                        }}
                      >
                        <View>
                          <Text style={[styles.modalItemText, { color: c.text }]}>
                            {dish.name}
                          </Text>
                          <Text
                            style={[styles.modalItemSubtext, { color: c.textMuted }]}
                          >
                            {dish.price} ₸
                          </Text>
                        </View>
                        {selectedDishId === dish.dish_id && (
                          <Ionicons name="checkmark" size={20} color={c.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
            {dishes.length === 0 && (
              <Text style={[styles.hint, { color: c.textMuted }]}>
                Сначала добавьте блюдо
              </Text>
            )}
          </View>

          {/* Info Card */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: c.primary + "15", borderColor: c.primary + "30" },
            ]}
          >
            <Ionicons name="information-circle" size={20} color={c.primary} />
            <Text style={[styles.infoText, { color: c.text }]}>
              Выберите блюдо, чтобы пользователи могли добавить его в корзину прямо из
              видео!
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: createVideoMutation.isPending ? c.textMuted : c.primary },
            ]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={createVideoMutation.isPending}
          >
            {createVideoMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Загрузить видео</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoSection: {
    height: 300,
    margin: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  videoPlaceholderText: {
    fontSize: 18,
    fontWeight: "700",
  },
  form: {
    padding: 16,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerButtonText: {
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "70%",
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalList: {
    padding: 16,
  },
  modalItem: {
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalItemSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  hint: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: "italic",
  },
  infoCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
