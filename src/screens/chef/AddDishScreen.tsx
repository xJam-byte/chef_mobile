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
    const [type, setType] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [image, setImage] = useState<string | null>(null);

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
        if (!type.trim()) {
            showMessage({ message: t('addDish.errorTypeRequired'), type: "warning" });
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

        // console.log("chefId", chefId)
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
                type: type.trim(),
                ingredients: ingredients.trim(),
                picture: image, // base64 data URL
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
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    t('addDish.noPermission'),
                    t('addDish.permissionRequired')
                );
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                // Create base64 data URL
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
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Upload Section */}
                <TouchableOpacity
                    style={[styles.imageSection, { backgroundColor: c.surface, borderColor: c.border }]}
                    onPress={handleImagePick}
                    activeOpacity={0.8}
                    disabled={isLoading}
                >
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="camera" size={48} color={c.textMuted} />
                            <Text style={[styles.imagePlaceholderText, { color: c.textMuted }]}>
                                {t('addDish.addPhoto')}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            {t('addDish.name')} <Text style={{ color: c.error }}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder={t('addDish.namePlaceholder')}
                            placeholderTextColor={c.textMuted}
                            value={dishName}
                            onChangeText={setDishName}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            {t('addDish.description')} <Text style={{ color: c.error }}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder={t('addDish.descriptionPlaceholder')}
                            placeholderTextColor={c.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Price */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            {t('addDish.price')} <Text style={{ color: c.error }}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder={t('addDish.pricePlaceholder')}
                            placeholderTextColor={c.textMuted}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Type */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            {t('addDish.type')} <Text style={{ color: c.error }}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder={t('addDish.typePlaceholder')}
                            placeholderTextColor={c.textMuted}
                            value={type}
                            onChangeText={setType}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Ingredients */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: c.text }]}>
                            {t('addDish.ingredients')} <Text style={{ color: c.error }}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                            placeholder={t('addDish.ingredientsPlaceholder')}
                            placeholderTextColor={c.textMuted}
                            value={ingredients}
                            onChangeText={setIngredients}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            editable={!isLoading}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitBtn,
                            { backgroundColor: isLoading ? c.textMuted : c.primary },
                        ]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                <Text style={styles.submitBtnText}>{t('addDish.submit')}</Text>
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
