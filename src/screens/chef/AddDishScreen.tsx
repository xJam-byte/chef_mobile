/**
 * Add Dish Screen - For chefs to add new dishes
 */

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";

export default function AddDishScreen({ navigation }: any) {
    const c = useColors();
    const [dishName, setDishName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [type, setType] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [image, setImage] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!dishName || !price) {
            Alert.alert("Ошибка", "Заполните название и цену блюда");
            return;
        }

        // TODO: API call to create dish
        console.log({
            name: dishName,
            description,
            price: parseFloat(price),
            type,
            ingredients,
            image,
        });

        Alert.alert("Успешно", "Блюдо добавлено!", [
            { text: "OK", onPress: () => navigation.goBack() },
        ]);
    };

    const handleImagePick = () => {
        // TODO: Implement image picker
        Alert.alert("Выбор фото", "Функция выбора фото будет добавлена");
    };

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Upload Section */}
                <TouchableOpacity
                    style={[styles.imageSection, { backgroundColor: c.surface, borderColor: c.border }]}
                    onPress={handleImagePick}
                    activeOpacity={0.8}
                >
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="camera" size={48} color={c.textMuted} />
                            <Text style={[styles.imagePlaceholderText, { color: c.textMuted }]}>
                                Добавить фото блюда
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            Название блюда <Text style={{ color: c.error }}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder="Например: Плов"
                            placeholderTextColor={c.textMuted}
                            value={dishName}
                            onChangeText={setDishName}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>Описание</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder="Расскажите о блюде..."
                            placeholderTextColor={c.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Price */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            Цена (₸) <Text style={{ color: c.error }}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder="2000"
                            placeholderTextColor={c.textMuted}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Type */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>Тип блюда</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder="Например: Основное блюдо"
                            placeholderTextColor={c.textMuted}
                            value={type}
                            onChangeText={setType}
                        />
                    </View>

                    {/* Ingredients */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>Ингредиенты</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder="Рис, мясо, морковь, лук..."
                            placeholderTextColor={c.textMuted}
                            value={ingredients}
                            onChangeText={setIngredients}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: c.primary }]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.submitBtnText}>Добавить блюдо</Text>
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
    imageSection: {
        height: 250,
        margin: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: "dashed",
        overflow: "hidden",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    imagePlaceholderText: {
        fontSize: 16,
        fontWeight: "600",
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
