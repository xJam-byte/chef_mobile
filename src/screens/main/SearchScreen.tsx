import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Platform,
    ActivityIndicator,
    Modal,
    ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColors } from "../../lib/theme";
import { useChefs, useDishes } from "../../lib/hooks";
import { useCart } from "../../lib/hooks/useCart";
import { ChefCard, DishCard } from "../../components/features"; 
import { PremiumHeader, Button } from "../../components/ui";

type TabType = "dishes" | "chefs" | "map";

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
    const { addItem } = useCart();
    
    const [activeTab, setActiveTab] = useState<TabType>("dishes");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [userLocation, setUserLocation] = useState<Region | null>(null);
    const [locationPermission, setLocationPermission] = useState(false);
    
    // Filter Modal state
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    
    // Filters State
    const [activeSort, setActiveSort] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterMealTime, setFilterMealTime] = useState<string | null>(null);
    const [filterSpicy, setFilterSpicy] = useState<boolean | null>(null);
    const [filterHealthy, setFilterHealthy] = useState<boolean | null>(null);

    // Temp state for modal
    const [tempSort, setTempSort] = useState<string | null>(null);
    const [tempType, setTempType] = useState<string | null>(null);
    const [tempMealTime, setTempMealTime] = useState<string | null>(null);
    const [tempSpicy, setTempSpicy] = useState<boolean | null>(null);
    const [tempHealthy, setTempHealthy] = useState<boolean | null>(null);

    // Debounce search query to avoid spamming the backend
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch data with debounced search
    // Fetch data with debounced search and active filters
    const { data: dishesData, isLoading: isDishesLoading } = useDishes({ 
        page: 1, 
        limit: 50, 
        search: debouncedSearch,
        type: filterType ?? undefined,
        meal_time: filterMealTime ?? undefined,
        is_spicy: filterSpicy ?? undefined,
        is_healthy: filterHealthy ?? undefined,
        sort: activeSort ?? undefined,
    });
    const { data: chefsData, isLoading: isChefsLoading } = useChefs({ page: 1, limit: 50, search: debouncedSearch });
    
    const dishes = dishesData?.data ?? [];
    const chefs = chefsData?.data ?? [];

    // Request location permission and get user location
    useEffect(() => {
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

    const handleAddToCart = (dish: any) => {
      addItem(dish, 1);
    };

    return (
        <View style={[styles.root, { backgroundColor: c.background }]}>
            <PremiumHeader compact>
                <View style={styles.header}>
                    <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}>
                        <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: '#fff' }]}
                            placeholder={t('search.searchPlaceholder', 'Search...')}
                            placeholderTextColor="rgba(255,255,255,0.75)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            numberOfLines={1}
                            returnKeyType="search"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.filterButton, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}
                        onPress={() => {
                            setTempSort(activeSort);
                            setTempType(filterType);
                            setTempMealTime(filterMealTime);
                            setTempSpicy(filterSpicy);
                            setTempHealthy(filterHealthy);
                            setFilterModalVisible(true);
                        }}
                    >
                        <Ionicons name="options-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </PremiumHeader>

            {/* Tab Switcher */}
            <View style={[styles.tabSwitcher, { borderBottomColor: c.border }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "dishes" && { borderBottomColor: c.primary },
                    ]}
                    onPress={() => setActiveTab("dishes")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === "dishes" ? c.primary : c.textMuted },
                        ]}
                    >
                        {t('search.dishes', 'Dishes')}
                    </Text>
                </TouchableOpacity>

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
                        {t('search.chefs', 'Chefs')}
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
                        {t('search.map', 'Map')}
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
            ) : activeTab === "dishes" ? (
                <FlatList
                    data={dishes}
                    renderItem={({ item }) => (
                        <View style={styles.cardWrapper}>
                            <DishCard 
                                dish={item} 
                                onPress={() => navigation.navigate("DishDetail", { dishId: item.dish_id })} 
                                onAddToCart={() => handleAddToCart(item)}
                            />
                        </View>
                    )}
                    keyExtractor={(item) => item.dish_id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            {isDishesLoading ? (
                                <ActivityIndicator size="large" color={c.primary} />
                            ) : (
                                <>
                                    <Ionicons name="restaurant-outline" size={48} color={c.textMuted} />
                                    <Text style={[styles.emptyText, { color: c.textMuted }]}>
                                        {debouncedSearch ? t('search.noDishesFound', 'No dishes found') : t('search.noDishes', 'No dishes available')}
                                    </Text>
                                </>
                            )}
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={chefs}
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
                            {isChefsLoading ? (
                                <ActivityIndicator size="large" color={c.primary} />
                            ) : (
                                <>
                                    <Ionicons name="search-outline" size={48} color={c.textMuted} />
                                    <Text style={[styles.emptyText, { color: c.textMuted }]}>
                                        {debouncedSearch ? t('search.noResults', 'No chefs found for this query') : t('search.noChefs', 'No chefs available')}
                                    </Text>
                                </>
                            )}
                        </View>
                    }
                />
            )}

            {/* Filter Modal */}
            <Modal
                visible={filterModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: c.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: c.text }]}>{t('search.filters', 'Filters')}</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Ionicons name="close" size={24} color={c.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {/* Сортировка */}
                            <Text style={[styles.filterSectionTitle, { color: c.text }]}>{t('search.sortBy', 'Сортировка')}</Text>
                            <View style={styles.filterOptions}>
                                {['rating', 'price_asc', 'price_desc', 'newest'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.filterOptionButton,
                                            { backgroundColor: tempSort === option ? c.primary : c.background, borderColor: tempSort === option ? c.primary : c.border }
                                        ]}
                                        onPress={() => setTempSort(option)}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            { color: tempSort === option ? '#fff' : c.text }
                                        ]}>
                                            {t(`search.sort_${option}`, option)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Тип блюда */}
                            <Text style={[styles.filterSectionTitle, { color: c.text, marginTop: 20 }]}>{t('search.dishType', 'Тип блюда')}</Text>
                            <View style={styles.filterOptions}>
                                {['main', 'soup', 'snack', 'dessert', 'drink', 'any'].map((option) => {
                                    const isSelected = tempType === option || (option === 'any' && !tempType);
                                    return (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.filterOptionButton,
                                            { backgroundColor: isSelected ? c.primary : c.background, borderColor: isSelected ? c.primary : c.border }
                                        ]}
                                        onPress={() => setTempType(option === 'any' ? null : option)}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            { color: isSelected ? '#fff' : c.text }
                                        ]}>
                                            {t(`search.type_${option}`, option === 'any' ? 'Любой' : option)}
                                        </Text>
                                    </TouchableOpacity>
                                )})}
                            </View>
                            
                            {/* Время приема пищи */}
                            <Text style={[styles.filterSectionTitle, { color: c.text, marginTop: 20 }]}>{t('search.mealTime', 'Время приема')}</Text>
                            <View style={styles.filterOptions}>
                                {['any', 'breakfast', 'lunch', 'dinner'].map((option) => {
                                    const isSelected = tempMealTime === option || (option === 'any' && !tempMealTime);
                                    return (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.filterOptionButton,
                                            { backgroundColor: isSelected ? c.primary : c.background, borderColor: isSelected ? c.primary : c.border }
                                        ]}
                                        onPress={() => setTempMealTime(option === 'any' ? null : option)}
                                    >
                                        <Text style={[
                                            styles.filterOptionText,
                                            { color: isSelected ? '#fff' : c.text }
                                        ]}>
                                            {t(`search.meal_${option}`, option === 'any' ? 'Любое' : option)}
                                        </Text>
                                    </TouchableOpacity>
                                )})}
                            </View>

                            {/* Особенности */}
                            <Text style={[styles.filterSectionTitle, { color: c.text, marginTop: 20 }]}>{t('search.features', 'Особенности')}</Text>
                            <View style={styles.filterOptions}>
                                <TouchableOpacity
                                    style={[
                                        styles.filterOptionButton,
                                        { backgroundColor: tempSpicy ? c.primary : c.background, borderColor: tempSpicy ? c.primary : c.border }
                                    ]}
                                    onPress={() => setTempSpicy(!tempSpicy)}
                                >
                                    <Text style={[
                                        styles.filterOptionText,
                                        { color: tempSpicy ? '#fff' : c.text }
                                    ]}>
                                        {t('search.feature_spicy', '🌶️ Острое')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.filterOptionButton,
                                        { backgroundColor: tempHealthy ? c.primary : c.background, borderColor: tempHealthy ? c.primary : c.border }
                                    ]}
                                    onPress={() => setTempHealthy(!tempHealthy)}
                                >
                                    <Text style={[
                                        styles.filterOptionText,
                                        { color: tempHealthy ? '#fff' : c.text }
                                    ]}>
                                        {t('search.feature_healthy', '🥗 ПП (Здоровое)')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                        
                        <View style={[styles.modalFooter, { borderTopColor: c.border }]}>
                            <Button 
                                title={t('search.resetFilters', 'Reset')} 
                                variant="outline" 
                                onPress={() => { 
                                    setTempSort(null);
                                    setTempType(null);
                                    setTempMealTime(null);
                                    setTempSpicy(null);
                                    setTempHealthy(null);
                                    setActiveSort(null);
                                    setFilterType(null);
                                    setFilterMealTime(null);
                                    setFilterSpicy(null);
                                    setFilterHealthy(null);
                                    setFilterModalVisible(false);
                                }} 
                                style={{ flex: 1, marginRight: 8 }} 
                            />
                            <Button 
                                title={t('search.applyFilters', 'Apply')} 
                                onPress={() => {
                                    setActiveSort(tempSort);
                                    setFilterType(tempType);
                                    setFilterMealTime(tempMealTime);
                                    setFilterSpicy(tempSpicy);
                                    setFilterHealthy(tempHealthy);
                                    setFilterModalVisible(false);
                                }} 
                                style={{ flex: 1 }} 
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: 0,
        height: '100%',
        paddingVertical: 0,
        includeFontPadding: false,
        textAlignVertical: 'center',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    modalBody: {
        marginBottom: 20,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    filterOptions: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    filterOptionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    filterOptionText: {
        fontSize: 14,
        fontWeight: "600",
    },
    modalFooter: {
        flexDirection: "row",
        paddingTop: 16,
        borderTopWidth: 1,
    },
});
