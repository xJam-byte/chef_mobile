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
import { PremiumHeader } from "../../components/ui/PremiumHeader";
import { LinearGradient } from "expo-linear-gradient";

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

    // Векторные иконки вместо эмодзи: эмодзи на части устройств рендерятся как "?"
    const categories: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { label: "Основные блюда", value: "Основные блюда", icon: "restaurant" },
        { label: "Супы", value: "Супы", icon: "flame" },
        { label: "Салаты", value: "Салаты", icon: "leaf" },
        { label: "Десерты", value: "Десерты", icon: "ice-cream" },
        { label: "Напитки", value: "Напитки", icon: "cafe" },
        { label: "Национальные", value: "Национальные", icon: "earth" },
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
            <PremiumHeader 
                title={t('addDish.title', 'Add New Dish')}
                backButton
            />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}>
                {/* Image Upload Section */}
                <View style={[styles.section]}>
                    <Text style={[styles.labelIcon, { color: c.text }]}>
                        {t('addDish.photoLabel')} <Text style={{ fontSize: 13, color: c.textSecondary, fontWeight: '400' }}>(max 5)</Text>
                    </Text>
                    <TouchableOpacity
                        style={[styles.imageSection, { backgroundColor: c.card, borderColor: c.border }]}
                        onPress={handleImagePick}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        {image ? (
                            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <View style={[styles.placeholderIconCircle, { backgroundColor: c.input }]}>
                                    <Ionicons name="camera" size={32} color={c.primary} />
                                </View>
                                <Text style={[styles.imagePlaceholderText, { color: c.textSecondary }]}>
                                    {t('addDish.addPhotoText', 'Tap to upload photo')}
                                </Text>
                            </View>
                        )}
                        {/* Edit overlay if image exists */}
                        {image && (
                            <View style={styles.editOverlay}>
                                <Ionicons name="pencil" size={20} color="#fff" />
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
                            style={[styles.input, { backgroundColor: c.input, color: c.text, borderColor: c.border }]}
                            placeholder={t('addDish.namePlaceholder', 'e.g. Grandma\'s Beshbarmak')}
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
                            style={[styles.textArea, { backgroundColor: c.input, color: c.text, borderColor: c.border }]}
                            placeholder={t('addDish.descriptionPlaceholder', 'Describe ingredients and key features...')}
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
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={[styles.label, { color: c.text }]}>
                                {t('addDish.price', 'Price (₸)')}
                            </Text>
                            <View style={styles.priceContainer}>
                                <TextInput
                                    style={[styles.input, { backgroundColor: c.input, color: c.text, borderColor: c.border, flex: 1 }]}
                                    placeholder="0"
                                    placeholderTextColor={c.textMuted}
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={[styles.label, { color: c.text }]}>
                                {t('addDish.time', 'Time (min)')}
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.input, color: c.text, borderColor: c.border }]}
                                placeholder="0"
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
                            {t('addDish.category', 'Category')}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.value}
                                    style={[
                                        styles.categoryPill,
                                        { 
                                            backgroundColor: type === cat.value ? c.primary : c.card, 
                                            borderColor: type === cat.value ? c.primary : c.border 
                                        }
                                    ]}
                                    onPress={() => setType(cat.value)}
                                >
                                    <Ionicons
                                        name={cat.icon}
                                        size={16}
                                        color={type === cat.value ? '#fff' : c.primary}
                                    />
                                    <Text style={[styles.categoryText, { color: type === cat.value ? '#fff' : c.text }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                     <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            {t('addDish.ingredients')} <Text style={{ color: c.error }}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.input, color: c.text, borderColor: c.border }]}
                            placeholder={t('addDish.ingredientsPlaceholder')}
                            placeholderTextColor={c.textMuted}
                            value={ingredients}
                            onChangeText={setIngredients}
                             editable={!isLoading}
                        />
                    </View>


                    {/* Spicy Toggle */}
                    <TouchableOpacity
                        style={[styles.toggleContainer, { backgroundColor: c.card, borderColor: c.border }]}
                        onPress={() => setIsSpicy(!isSpicy)}
                        activeOpacity={0.8}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={[styles.iconBox, { backgroundColor: '#FF3B3015' }]}>
                                <Ionicons name="flame" size={20} color="#FF3B30" />
                            </View>
                            <Text style={[styles.toggleLabel, { color: c.text }]}>{t('addDish.isSpicy', 'Spicy Dish')}</Text>
                        </View>
                        <View style={[styles.checkbox, { borderColor: isSpicy ? c.primary : c.border, backgroundColor: isSpicy ? c.primary : 'transparent' }]}>
                            {isSpicy && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.submitBtnContainer}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={[c.primary, '#F97316']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitBtnGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="add-circle" size={24} color="#fff" />
                                    <Text style={styles.submitBtnText}>{t('addDish.submitBtn', 'Add Dish to Menu')}</Text>
                                </>
                            )}
                        </LinearGradient>
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
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    labelIcon: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },
    imageSection: {
        height: 240,
        borderRadius: 24,
        borderWidth: 1,
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
        gap: 12,
    },
    placeholderIconCircle: {
        width: 64, height: 64, borderRadius: 32,
        alignItems: 'center', justifyContent: 'center',
    },
    imagePlaceholderText: {
        fontSize: 15,
        fontWeight: "600",
    },
    editOverlay: {
        position: 'absolute', top: 12, right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)', width: 36, height: 36,
        borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    },
    form: {
        padding: 20,
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
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        minHeight: 120,
    },
    priceContainer: { flexDirection: 'row', alignItems: 'center' },
    
    categoriesContainer: {
        gap: 8,
        paddingRight: 20,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 100,
        borderWidth: 1,
        gap: 6,
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
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 32,
    },
    iconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
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
    submitBtnContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: "#F97316",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 20,
    },
    submitBtnGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        gap: 10,
    },
    submitBtnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
    },
});
