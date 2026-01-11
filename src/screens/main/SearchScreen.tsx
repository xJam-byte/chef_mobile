import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { useDishes, useChefs } from "../../lib/hooks";
import type { Dish } from "../../lib/types";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - (COLUMN_COUNT + 1) * CARD_MARGIN) / COLUMN_COUNT;

type TabType = "map" | "menu";

// Default location - Almaty, Kazakhstan
const DEFAULT_REGION = {
    latitude: 43.2220,
    longitude: 76.8512,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function SearchScreen({ navigation }: any) {
    const c = useColors();
    const [activeTab, setActiveTab] = useState<TabType>("menu");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch dishes and chefs
    const { data: dishesData } = useDishes({ page: 1, limit: 50 });
    const { data: chefsData } = useChefs({ page: 1, limit: 20 });

    const dishes = dishesData?.data ?? [];
    const chefs = chefsData?.data ?? [];

    // Filter dishes based on search query
    const filteredDishes = dishes.filter((dish) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
            dish.name.toLowerCase().includes(query) ||
            dish.description?.toLowerCase().includes(query) ||
            dish.ingredients?.toLowerCase().includes(query) ||
            dish.type?.toLowerCase().includes(query)
        );
    });

    // Generate chef markers (spread around Almaty)
    const chefMarkers = chefs.map((chef) => ({
        chef,
        coordinate: {
            latitude: DEFAULT_REGION.latitude + (Math.random() - 0.5) * 0.05,
            longitude: DEFAULT_REGION.longitude + (Math.random() - 0.5) * 0.05,
        },
    }));

    const renderDishCard = ({ item }: { item: Dish }) => (
        <TouchableOpacity
            style={[
                styles.dishCard,
                { backgroundColor: c.card, borderColor: c.border },
            ]}
            onPress={() => navigation.navigate("DishDetail", { dishId: item.dish_id })}
            activeOpacity={0.8}
        >
            {item.picture ? (
                <Image
                    source={{ uri: item.picture }}
                    style={styles.dishImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.dishImagePlaceholder, { backgroundColor: c.surface }]}>
                    <Ionicons name="restaurant" size={32} color={c.textMuted} />
                </View>
            )}

            <View style={styles.dishInfo}>
                <Text style={[styles.dishName, { color: c.text }]} numberOfLines={1}>
                    {item.name}
                </Text>

                <Text style={[styles.dishType, { color: c.textMuted }]} numberOfLines={1}>
                    {item.type}
                </Text>

                <View style={styles.dishFooter}>
                    <Text style={[styles.dishPrice, { color: c.primary }]}>
                        {item.price} ₸
                    </Text>

                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: c.primary }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            // TODO: Add to cart functionality
                            console.log("Add to cart:", item.dish_id);
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.root, { backgroundColor: c.background }]}>
            {/* Search Bar */}
            <View style={[styles.searchBar, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
                <Ionicons name="search" size={20} color={c.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: c.text }]}
                    placeholder="Поиск по блюдам, ингредиентам..."
                    placeholderTextColor={c.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={20} color={c.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Tab Switcher */}
            <View style={[styles.tabSwitcher, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "map" && { borderBottomColor: c.primary, borderBottomWidth: 3 },
                    ]}
                    onPress={() => setActiveTab("map")}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="map"
                        size={20}
                        color={activeTab === "map" ? c.primary : c.textMuted}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === "map" ? c.primary : c.textMuted },
                        ]}
                    >
                        Карта
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "menu" && { borderBottomColor: c.primary, borderBottomWidth: 3 },
                    ]}
                    onPress={() => setActiveTab("menu")}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="grid"
                        size={20}
                        color={activeTab === "menu" ? c.primary : c.textMuted}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === "menu" ? c.primary : c.textMuted },
                        ]}
                    >
                        Меню
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            {activeTab === "map" ? (
                // Map View with Chef Markers
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                        initialRegion={DEFAULT_REGION}
                        showsUserLocation
                        showsMyLocationButton
                    >
                        {chefMarkers.map((marker) => (
                            <Marker
                                key={marker.chef.chef_id}
                                coordinate={marker.coordinate}
                                onPress={() => {
                                    navigation.navigate("ChefDetail", { chefId: marker.chef.chef_id });
                                }}
                            >
                                <View style={[styles.markerContainer, { backgroundColor: c.primary }]}>
                                    <Ionicons name="restaurant" size={20} color="#fff" />
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Map Info Overlay */}
                    <View style={[styles.mapInfo, { backgroundColor: c.card }]}>
                        <Ionicons name="information-circle" size={16} color={c.primary} />
                        <Text style={[styles.mapInfoText, { color: c.text }]}>
                            Нажмите на маркер повара ({chefs.length} на карте)
                        </Text>
                    </View>
                </View>
            ) : (
                // Menu Grid View
                <FlatList
                    key="menu-grid"
                    data={filteredDishes}
                    renderItem={renderDishCard}
                    keyExtractor={(item) => item.dish_id.toString()}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={styles.dishGrid}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={48} color={c.textMuted} />
                            <Text style={[styles.emptyText, { color: c.textMuted }]}>
                                {searchQuery ? "Ничего не найдено" : "Нет доступных блюд"}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
    tabSwitcher: {
        flexDirection: "row",
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        gap: 8,
    },
    tabText: {
        fontSize: 15,
        fontWeight: "600",
    },
    mapContainer: {
        flex: 1,
        position: "relative",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    markerContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    mapInfo: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 12,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    mapInfoText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
    },
    dishGrid: {
        padding: CARD_MARGIN,
    },
    dishCard: {
        width: CARD_WIDTH,
        margin: CARD_MARGIN / 2,
        borderRadius: 16,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dishImage: {
        width: "100%",
        height: 140,
    },
    dishImagePlaceholder: {
        width: "100%",
        height: 140,
        alignItems: "center",
        justifyContent: "center",
    },
    dishInfo: {
        padding: 12,
    },
    dishName: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 4,
    },
    dishType: {
        fontSize: 12,
        marginBottom: 8,
    },
    dishFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dishPrice: {
        fontSize: 16,
        fontWeight: "800",
    },
    addBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
});
