/**
 * Address Management Screen
 * Allows users to view, add, and manage their delivery addresses
 */

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { useMyAddresses, useCreateAddress, useProfile } from "../../lib/hooks";
import { showMessage } from "react-native-flash-message";
import { Card } from "../../components/ui";

export default function AddressManagementScreen() {
    const c = useColors();
    const { data: profile } = useProfile();
    const userId = profile?.user_id;

    const { data: addresses, isLoading } = useMyAddresses(userId);
    const createAddressMutation = useCreateAddress();

    const [isAdding, setIsAdding] = useState(false);
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostalCode] = useState("");

    const handleAddAddress = async () => {
        if (!street.trim() || !city.trim() || !postalCode.trim()) {
            showMessage({ message: "Заполните все поля", type: "warning" });
            return;
        }

        if (!userId) {
            showMessage({ message: "Пользователь не найден", type: "danger" });
            return;
        }

        try {
            await createAddressMutation.mutateAsync({
                userId,
                street: street.trim(),
                city: city.trim(),
                postalCode: postalCode.trim(),
            });

            showMessage({ message: "Адрес добавлен!", type: "success" });
            setIsAdding(false);
            setStreet("");
            setCity("");
            setPostalCode("");
        } catch (error: any) {
            console.error("Error creating address:", error);
            showMessage({
                message: error?.response?.data?.message || "Ошибка при добавлении адреса",
                type: "danger",
            });
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: c.background }]}>
                <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 40 }} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Address List */}
                {addresses && addresses.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: c.text }]}>
                            Ваши адреса
                        </Text>
                        {addresses.map((address: any) => (
                            <Card key={address.address_id} style={styles.addressCard}>
                                <View style={styles.addressHeader}>
                                    <Ionicons name="location" size={20} color={c.primary} />
                                    <Text style={[styles.addressTitle, { color: c.text }]}>
                                        {address.city}
                                    </Text>
                                </View>
                                <Text style={[styles.addressText, { color: c.textSecondary }]}>
                                    {address.street}
                                </Text>
                                <Text style={[styles.addressText, { color: c.textMuted }]}>
                                    Индекс: {address.postal_code}
                                </Text>
                            </Card>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={64} color={c.textMuted} />
                        <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                            У вас пока нет сохраненных адресов
                        </Text>
                    </View>
                )}

                {/* Add Address Section */}
                {!isAdding ? (
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: c.primary }]}
                        onPress={() => setIsAdding(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle" size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Добавить адрес</Text>
                    </TouchableOpacity>
                ) : (
                    <Card style={styles.formCard}>
                        <Text style={[styles.formTitle, { color: c.text }]}>
                            Новый адрес
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: c.text }]}>
                                Улица и номер дома *
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                                placeholder="Например: Абая 150"
                                placeholderTextColor={c.textMuted}
                                value={street}
                                onChangeText={setStreet}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: c.text }]}>
                                Город *
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                                placeholder="Например: Алматы"
                                placeholderTextColor={c.textMuted}
                                value={city}
                                onChangeText={setCity}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: c.text }]}>
                                Индекс *
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
                                placeholder="Например: 050000"
                                placeholderTextColor={c.textMuted}
                                value={postalCode}
                                onChangeText={setPostalCode}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { borderColor: c.border }]}
                                onPress={() => {
                                    setIsAdding(false);
                                    setStreet("");
                                    setCity("");
                                    setPostalCode("");
                                }}
                                activeOpacity={0.7}
                                disabled={createAddressMutation.isPending}
                            >
                                <Text style={[styles.cancelButtonText, { color: c.text }]}>
                                    Отмена
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: c.primary }]}
                                onPress={handleAddAddress}
                                activeOpacity={0.8}
                                disabled={createAddressMutation.isPending}
                            >
                                {createAddressMutation.isPending ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Сохранить</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Card>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    addressCard: {
        marginBottom: 12,
        padding: 16,
    },
    addressHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
    addressText: {
        fontSize: 14,
        marginTop: 4,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        textAlign: "center",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        margin: 16,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    formCard: {
        margin: 16,
        padding: 16,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "600",
    },
    saveButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    bottomPadding: {
        height: 32,
    },
});
