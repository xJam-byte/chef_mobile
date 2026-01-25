/**
 * Add Dish Screen - For chefs to add new dishes
 * FULLY IMPLEMENTED with image picker and API integration
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
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { useCreateDish, useProfile } from "../../lib/hooks";
import { showMessage } from "react-native-flash-message";
import { useChefByUserId } from "../../lib/hooks/useChefs";

export default function AddDishScreen({ navigation }: any) {
    const c = useColors();
    const { t } = useTranslation();
    const { data: profile } = useProfile();
    // console.log(profile)
    const createDishMutation = useCreateDish();
    const { data: chef } = useChefByUserId(profile?.user_id);
    // console.log(chef)

    const [dishName, setDishName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [time, setTime] = useState("");
    const [type, setType] = useState("Основные блюда");
    const [ingredients, setIngredients] = useState("");
    const [isSpicy, setIsSpicy] = useState(false);
    const [image, setImage] = useState<string | null>(null);

    const categories = [
        { label: "Основные блюда", value: "Основные блюда", icon: "🍖" },
        { label: "Супы", value: "Супы", icon: "🥣" },
        { label: "Салаты", value: "Салаты", icon: "🥗" },
        { label: "Десерты", value: "Десерты", icon: "🍰" },
        { label: "Напитки", value: "Напитки", icon: "🍹" },
        { label: "Национальные", value: "Национальные", icon: "🥟" },
    ];

    const handleSubmit = async () => {
        // Validation
        if (!dishName.trim()) {
            showMessage({ message: t('addDish.errorNameRequired'), type: "warning" });
            return;
        }
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            showMessage({ message: t('addDish.errorPriceRequired'), type: "warning" });
            return;
        }
        if (!description.trim()) {
            showMessage({ message: t('addDish.errorDescriptionRequired'), type: "warning" });
            return;
        }
        if (!ingredients.trim()) {
            showMessage({ message: t('addDish.errorIngredientsRequired'), type: "warning" });
            return;
        }
        if (!image) {
            showMessage({ message: t('addDish.errorImageRequired'), type: "warning" });
            return;
        }

        // Get chef ID from profile
        const chefId = chef?.chef_id;

        if (!chefId) {
            showMessage({ message: t('addDish.errorChefNotFound'), type: "danger" });
            return;
        }

        try {
            await createDishMutation.mutateAsync({
                chefId,
                name: dishName.trim(),
                description: description.trim(),
                price: Number(price),
                type: type,
                ingredients: ingredients.trim(),
                picture: image, // base64 data URL
                time: time ? Number(time) : 0,
                is_spicy: isSpicy,
            });

            showMessage({ message: t('addDish.success'), type: "success" });
            navigation.goBack();
        } catch (error: any) {
            console.error("Error creating dish:", error);
            showMessage({
                message: error?.response?.data?.message || t('addDish.errorCreatingDish'),
                type: "danger",
            });
        }
    };

    const handleImagePick = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    t('addDish.noPermission'),
                    t('addDish.permissionRequired')
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const base64 = asset.base64;
                const mimeType = asset.uri.endsWith(".png") ? "image/png" : "image/jpeg";
                const dataUrl = `data:${mimeType};base64,${base64}`;
                setImage(dataUrl);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert(t('common.error'), t('addDish.errorSelectingImage'));
        }
    };

    const isLoading = createDishMutation.isPending;

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Image Upload Section */}
                <View style={[styles.section, { paddingTop: 20 }]}>
                    <Text style={[styles.labelIcon, { color: c.primary }]}>📷 <Text style={{ color: c.text }}>{t('addDish.photoLabel')} <Text style={{ fontSize: 13, color: c.textMuted, fontWeight: '400' }}>(до 5 фото)</Text></Text></Text>
                    <TouchableOpacity
                        style={[styles.imageSection, { backgroundColor: '#2A2A2A', borderColor: '#3A3A3A' }]}
                        onPress={handleImagePick}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        {image ? (
                            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#3A3A3A', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                    <Ionicons name="image-outline" size={30} color={c.textMuted} />
                                </View>
                                <Text style={[styles.imagePlaceholderText, { color: c.textMuted }]}>
                                    {t('addDish.addPhotoText', 'Добавить фото')}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            {t('addDish.name')}
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: '#2A2A2A', color: c.text, borderColor: '#3A3A3A' }]}
                            placeholder={t('addDish.namePlaceholder', 'Например: Бешбармак по-домашнему')}
                            placeholderTextColor={c.textMuted}
                            value={dishName}
                            onChangeText={setDishName}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            {t('addDish.description')}
                        </Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: '#2A2A2A', color: c.text, borderColor: '#3A3A3A' }]}
                            placeholder={t('addDish.descriptionPlaceholder', 'Расскажите о составе и особенностях блюда...')}
                            placeholderTextColor={c.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Price & Time Row */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={[styles.label, { color: c.text }]}>
                                💲 {t('addDish.price', 'Цена (₸)')}
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#2A2A2A', color: c.text, borderColor: '#3A3A3A' }]}
                                placeholder="3500"
                                placeholderTextColor={c.textMuted}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                editable={!isLoading}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                            <Text style={[styles.label, { color: c.text }]}>
                                🕒 {t('addDish.time', 'Время (мин)')}
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#2A2A2A', color: c.text, borderColor: '#3A3A3A' }]}
                                placeholder="45"
                                placeholderTextColor={c.textMuted}
                                value={time}
                                onChangeText={setTime}
                                keyboardType="numeric"
                                editable={!isLoading}
                            />
                        </View>
                    </View>

                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text, marginBottom: 12 }]}>
                            {t('addDish.category', 'Категория')}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.value}
                                    style={[
                                        styles.categoryPill,
                                        { backgroundColor: type === cat.value ? '#2A2A2A' : '#1E1E1E', borderColor: type === cat.value ? c.primary : '#3A3A3A' }
                                    ]}
                                    onPress={() => setType(cat.value)}
                                >
                                    <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                                    <Text style={[styles.categoryText, { color: c.text }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Ingredients (hidden in design but kept for backend compatibility if needed, using description instead for display? 
                        Design shows "Расскажите о составе..." in description input. 
                        Let's keep ingredients input but maybe simplified or assume description covers it. 
                        Wait, existing backend requires ingredients. Let's keep it but maybe put it below or merge conceptual.
                        Actually, let's keep it but make it look like part of "Details" or similar.
                        For now, I'll add it below categories to ensure data valid.
                    */}
                     <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            {t('addDish.ingredients')} <Text style={{ color: c.error }}>*</Text>
                        </Text>
                         {/* Using height 0 to hide visual if mapped to description in future, but for now user needs to input it.
                             Actually, let's repurpose "Ingredients" field as additional info or just keep it visible for now to not break logic.
                             The design didn't explicitly show "Ingredients" separate input, maybe it was merged with Description?
                             But backend has separate fields. I will leave it visible for correctness.
                         */}
                        <TextInput
                            style={[styles.input, { backgroundColor: '#2A2A2A', color: c.text, borderColor: '#3A3A3A' }]}
                            placeholder={t('addDish.ingredientsPlaceholder')}
                            placeholderTextColor={c.textMuted}
                            value={ingredients}
                            onChangeText={setIngredients}
                             editable={!isLoading}
                        />
                    </View>


                    {/* Spicy Toggle */}
                    <TouchableOpacity
                        style={[styles.toggleContainer, { backgroundColor: '#2A2A2A', borderColor: '#3A3A3A' }]}
                        onPress={() => setIsSpicy(!isSpicy)}
                        activeOpacity={0.8}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons name="flame-outline" size={24} color={c.text} />
                            <Text style={[styles.toggleLabel, { color: c.text }]}>{t('addDish.isSpicy', 'Острое блюдо')}</Text>
                        </View>
                        <View style={[styles.checkbox, { borderColor: isSpicy ? c.primary : c.textMuted, backgroundColor: isSpicy ? c.primary : 'transparent' }]}>
                            {isSpicy && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            { backgroundColor: c.primary },
                        ]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="add" size={24} color="#fff" />
                                <Text style={styles.submitBtnText}>{t('addDish.submitBtn', 'Добавить блюдо в меню')}</Text>
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
    section: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    labelIcon: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    imageSection: {
        height: 300,
        borderRadius: 24,
        borderWidth: 2,
        borderStyle: "dashed",
        overflow: "hidden",
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        alignItems: "center",
        justifyContent: "center",
    },
    imagePlaceholderText: {
        fontSize: 16,
        fontWeight: "400",
    },
    form: {
        padding: 16,
        paddingTop: 0,
    },
    inputGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 120,
    },
    categoriesContainer: {
        gap: 8,
        paddingRight: 16,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: "600",
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    toggleLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        borderRadius: 16,
        marginTop: 8,
        gap: 8,
    },
    submitBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
