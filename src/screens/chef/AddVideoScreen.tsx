/**
 * Add Video Screen - For chefs to add new videos
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";

export default function AddVideoScreen({ navigation }: any) {
    const c = useColors();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoUri, setVideoUri] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!title || !videoUri) {
            Alert.alert("Ошибка", "Выберите видео и укажите название");
            return;
        }

        // TODO: API call to upload video
        console.log({
            title,
            description,
            videoUri,
        });

        Alert.alert("Успешно", "Видео добавлено!", [
            { text: "OK", onPress: () => navigation.goBack() },
        ]);
    };

    const handleVideoPick = () => {
        // TODO: Implement video picker
        Alert.alert("Выбор видео", "Функция выбора видео будет добавлена");
        // Mock video URI for demo
        setVideoUri("mock-video-uri");
    };

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Video Upload Section */}
                <TouchableOpacity
                    style={[styles.videoSection, { backgroundColor: c.surface, borderColor: c.border }]}
                    onPress={handleVideoPick}
                    activeOpacity={0.8}
                >
                    <View style={styles.videoPlaceholder}>
                        <Ionicons name="videocam" size={64} color={c.textMuted} />
                        <Text style={[styles.videoPlaceholderText, { color: c.text }]}>
                            {videoUri ? "Видео выбрано" : "Выбрать видео"}
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
                            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder="Например: Как приготовить плов"
                            placeholderTextColor={c.textMuted}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>Описание</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder="Расскажите о видео..."
                            placeholderTextColor={c.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Info Card */}
                    <View style={[styles.infoCard, { backgroundColor: c.primary + "15", borderColor: c.primary + "30" }]}>
                        <Ionicons name="information-circle" size={20} color={c.primary} />
                        <Text style={[styles.infoText, { color: c.text }]}>
                            Рекомендуемый формат видео: вертикальное (9:16), не более 60 секунд
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: c.primary }]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="cloud-upload" size={20} color="#fff" />
                        <Text style={styles.submitBtnText}>Загрузить видео</Text>
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
