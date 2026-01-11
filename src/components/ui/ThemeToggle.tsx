import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/theme";

export const ThemeToggle: React.FC = () => {
    const { themeName, toggleTheme, theme } = useTheme();
    const isDark = themeName === "dark";

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <Ionicons
                    name={isDark ? "moon" : "sunny"}
                    size={20}
                    color={theme.primary}
                />
                <Text style={[styles.label, { color: theme.text }]}>
                    {isDark ? "Темная тема" : "Светлая тема"}
                </Text>
            </View>
            <View
                style={[
                    styles.toggle,
                    { backgroundColor: isDark ? theme.primary : theme.border },
                ]}
            >
                <View
                    style={[
                        styles.toggleThumb,
                        {
                            backgroundColor: theme.surface,
                            transform: [{ translateX: isDark ? 18 : 0 }],
                        },
                    ]}
                />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginVertical: 8,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
    },
    toggle: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
});
