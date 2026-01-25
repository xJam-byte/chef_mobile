import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { useChefs } from "../../lib/hooks";
import { ChefCard } from "../../components/features"; 
import { PremiumHeader } from "../../components/ui";
import { SafeAreaView } from "react-native-safe-area-context";

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
    const { data: chefsData, isLoading } = useChefs({ page: 1, limit: 50 });
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

    // Generate chef markers
    const baseLocation = userLocation || DEFAULT_REGION;
    const chefMarkers = chefs.map((chef: any, index: number) => {
        const addresses = chef.user?.addresses || [];
        const addressWithCoords = addresses.find((addr: any) => addr.latitude && addr.longitude);
        
        const coordinate = addressWithCoords
            ? {
                latitude: addressWithCoords.latitude,
                longitude: addressWithCoords.longitude,
              }
            : {
                latitude: baseLocation.latitude + (Math.cos(index * Math.PI / 4) * 0.02),
                longitude: baseLocation.longitude + (Math.sin(index * Math.PI / 4) * 0.02),
              };
        
        return {
            chef,
            coordinate,
            hasRealAddress: !!addressWithCoords,
        };
    });

    return (
        <View style={[styles.root, { backgroundColor: c.background }]}>
            <PremiumHeader compact>
                <View style={styles.header}>
                    <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}>
                        <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: '#fff' }]}
                            placeholder={t('search.searchPlaceholder')}
                            placeholderTextColor="rgba(255,255,255,0.7)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    <TouchableOpacity style={[styles.filterButton, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}>
                            <Ionicons name="options-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </PremiumHeader>

                {/* Tab Switcher (Floating or Integrated?) -> Integrated for now */}
                <View style={[styles.tabSwitcher, { borderBottomColor: c.border }]}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === "chefs" && { borderBottomColor: c.primary },
                        ]}
                        onPress={() => setActiveTab("chefs")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: activeTab === "chefs" ? c.primary : c.textMuted },
                            ]}
                        >
                            {t('search.chefs')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === "map" && { borderBottomColor: c.primary },
                        ]}
                        onPress={() => setActiveTab("map")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: activeTab === "map" ? c.primary : c.textMuted },
                            ]}
                        >
                            {t('search.map')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content Area */}
                {activeTab === "map" ? (
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                            initialRegion={userLocation || DEFAULT_REGION}
                            showsUserLocation={locationPermission}
                            showsMyLocationButton={locationPermission}
                            customMapStyle={c.name === 'dark' ? DARK_MAP_STYLE : []}
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
                                        { backgroundColor: c.primary, borderColor: "#fff" }
                                    ]}>
                                        <Ionicons name="restaurant" size={16} color="#fff" />
                                    </View>
                                </Marker>
                            ))}
                        </MapView>
                    </View>
                ) : (
                    <FlatList
                        data={filteredChefs}
                        renderItem={({ item }) => (
                             <View style={styles.cardWrapper}>
                                <ChefCard chef={item} onPress={() => navigation.navigate("ChefDetail", { chefId: item.chef_id })} />
                             </View>
                        )}
                        keyExtractor={(item) => item.chef_id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="search-outline" size={48} color={c.textMuted} />
                                <Text style={[styles.emptyText, { color: c.textMuted }]}>
                                    {searchQuery ? t('search.noResults') : t('search.noChefs')}
                                </Text>
                            </View>
                        }
                    />
                )}
            {/* </SafeAreaView> */}
        </View>
    );
}

const DARK_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f2835" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#2f3948" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
];

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%'
    },
    tabSwitcher: {
        flexDirection: "row",
        borderBottomWidth: 1,
        paddingHorizontal: 16,
    },
    tab: {
        marginRight: 24,
        paddingVertical: 14,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 16,
        fontWeight: "600",
    },
    mapContainer: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        margin: 16,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    markerContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    cardWrapper: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    listContent: {
        paddingVertical: 16,
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
