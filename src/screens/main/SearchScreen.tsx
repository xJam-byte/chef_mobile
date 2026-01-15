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
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { useChefs } from "../../lib/hooks";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - (COLUMN_COUNT + 1) * CARD_MARGIN) / COLUMN_COUNT;

type TabType = "map" | "chefs";

// Default location - Almaty, Kazakhstan
const DEFAULT_REGION = {
    latitude: 43.2220,
    longitude: 76.8512,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function SearchScreen({ navigation }: any) {
    const c = useColors();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>("chefs");
    const [searchQuery, setSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState<Region | null>(null);
    const [locationPermission, setLocationPermission] = useState(false);

    // Fetch chefs
    const { data: chefsData } = useChefs({ page: 1, limit: 50 });
    const chefs = chefsData?.data ?? [];

    // Request location permission and get user location
    React.useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setLocationPermission(false);
                return;
            }

            setLocationPermission(true);

            try {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            } catch (error) {
                console.error("Error getting location:", error);
            }
        })();
    }, []);

    // Filter chefs based on search query
    const filteredChefs = chefs.filter((chef: any) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        const name = chef.users?.name?.toLowerCase() || "";
        const bio = chef.bio?.toLowerCase() || "";
        
        return name.includes(query) || bio.includes(query);
    });

    // Generate chef markers based on their real addresses
    const baseLocation = userLocation || DEFAULT_REGION;
    
    const chefMarkers = chefs.map((chef: any, index: number) => {
        const addresses = chef.user?.addresses || [];
        
        const addressWithCoords = addresses.find((addr: any) => addr.latitude && addr.longitude);
        
        // If chef has real coordinates, use them. Otherwise scatter around user location.
        const coordinate = addressWithCoords
            ? {
                latitude: addressWithCoords.latitude,
                longitude: addressWithCoords.longitude,
              }
            : {
                // Spread chefs without coordinates around the center in a circle pattern
                latitude: baseLocation.latitude + (Math.cos(index * Math.PI / 4) * 0.02),
                longitude: baseLocation.longitude + (Math.sin(index * Math.PI / 4) * 0.02),
              };
        
        return {
            chef,
            coordinate,
            address: addressWithCoords,
            hasRealAddress: !!addressWithCoords,
        };
    });

    const renderChefCard = ({ item }: { item: any }) => {
        const chef = item;
        const avatarUri = chef.user?.profile_pic;
        const chefName = chef.user?.name || t('profile.chef');
        const rating = Number(chef.rating) || 0;
        
        return (
            <TouchableOpacity
                style={[
                    styles.chefCard,
                    { backgroundColor: c.card, borderColor: c.border },
                ]}
                onPress={() => navigation.navigate("ChefDetail", { chefId: chef.chef_id })}
                activeOpacity={0.8}
            >
                {/* Chef Avatar */}
                {avatarUri ? (
                    <Image
                        source={{ uri: avatarUri }}
                        style={styles.chefAvatar}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.chefAvatarPlaceholder, { backgroundColor: c.primary }]}>
                        <Ionicons name="person" size={48} color="#fff" />
                    </View>
                )}

                {/* Chef Info */}
                <View style={styles.chefInfo}>
                    <Text style={[styles.chefName, { color: c.text }]} numberOfLines={1}>
                        {chefName}
                    </Text>

                    {/* Rating */}
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={[styles.ratingText, { color: c.textSecondary }]}>
                            {rating.toFixed(1)}
                        </Text>
                    </View>

                    {/* Bio Preview */}
                    {chef.bio && (
                        <Text style={[styles.chefBio, { color: c.textMuted }]} numberOfLines={2}>
                            {chef.bio}
                        </Text>
                    )}

                    {/* View Profile Button */}
                    <View style={[styles.viewButton, { backgroundColor: c.primary }]}>
                    <Text style={styles.viewButtonText}>{t('search.profile')}</Text>
                        <Ionicons name="arrow-forward" size={14} color="#fff" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.root, { backgroundColor: c.background }]}>
            {/* Search Bar */}
            <View style={[styles.searchBar, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
                <Ionicons name="search" size={20} color={c.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: c.text }]}
                    placeholder={t('search.searchPlaceholder')}
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
                        {t('search.map')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "chefs" && { borderBottomColor: c.primary, borderBottomWidth: 3 },
                    ]}
                    onPress={() => setActiveTab("chefs")}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="people"
                        size={20}
                        color={activeTab === "chefs" ? c.primary : c.textMuted}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === "chefs" ? c.primary : c.textMuted },
                        ]}
                    >
                        {t('search.chefs')}
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
                        initialRegion={userLocation || DEFAULT_REGION}
                        showsUserLocation={locationPermission}
                        showsMyLocationButton={locationPermission}
                    >
                        {chefMarkers.map((marker) => (
                            <Marker
                                key={marker.chef.chef_id}
                                coordinate={marker.coordinate}
                                onPress={() => {
                                    navigation.navigate("ChefDetail", { chefId: marker.chef.chef_id });
                                }}
                            >
                                <View style={[
                                    styles.markerContainer, 
                                    { backgroundColor: marker.hasRealAddress ? c.primary : '#888' }
                                ]}>
                                    <Ionicons name="restaurant" size={20} color="#fff" />
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Map Info Overlay */}
                    <View style={[styles.mapInfo, { backgroundColor: c.card }]}>
                        <Ionicons name="information-circle" size={16} color={c.primary} />
                        <Text style={[styles.mapInfoText, { color: c.text }]}>
                            {t('search.mapInfo', { count: chefs.length })}
                        </Text>
                    </View>
                </View>
            ) : (
                // Chefs Grid View
                <FlatList
                    key="chefs-grid"
                    data={filteredChefs}
                    renderItem={renderChefCard}
                    keyExtractor={(item) => item.chef_id.toString()}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={styles.chefGrid}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color={c.textMuted} />
                            <Text style={[styles.emptyText, { color: c.textMuted }]}>
                                {searchQuery ? t('search.noResults') : t('search.noChefs')}
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
    chefGrid: {
        padding: CARD_MARGIN,
    },
    chefCard: {
        width: CARD_WIDTH,
        margin: CARD_MARGIN / 2,
        borderRadius: 16,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    chefAvatar: {
        width: "100%",
        height: 140,
    },
    chefAvatarPlaceholder: {
        width: "100%",
        height: 140,
        alignItems: "center",
        justifyContent: "center",
    },
    chefInfo: {
        padding: 12,
    },
    chefName: {
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: "600",
    },
    chefBio: {
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 12,
    },
    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    viewButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
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
