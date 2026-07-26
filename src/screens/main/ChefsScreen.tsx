/**
 * Chefs Screen - Map & List of chefs
 */

import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ChefCard } from "../../components/features";
import { Spinner } from "../../components/ui";
import { useChefs } from "../../lib/hooks";
import { useColors } from "../../lib/theme";
import type { Chef } from "../../lib/types";
import type { RootStackScreenProps } from "../../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

const ChefsScreen = () => {
  const c = useColors();
  const navigation =
    useNavigation<RootStackScreenProps<"MainTabs">["navigation"]>();

  const { data, isLoading, isRefetching, refetch } = useChefs({
    page: 1,
    limit: 50,
  });

  const handleChefPress = (chef: Chef) => {
    navigation.navigate("ChefDetail", {
      chefId: chef.chef_id,
    });
  };

  const MapPlaceholder = () => (
    <View style={[styles.mapContainer, { backgroundColor: "#231E1A" }]}>
       <View style={styles.mapMapbox}>
          <Ionicons name="location" size={48} color={c.primary} />
          <Text style={[styles.mapText, { color: c.textSecondary }]}>
            Карта Mapbox
          </Text>
          <Text style={[styles.mapSubText, { color: c.textSecondary }]}>
            Интеграция будет добавлена
          </Text>
       </View>
       <View style={styles.filterButtonContainer}>
          <View style={[styles.filterButton, { backgroundColor: c.card }]}>
             <Ionicons name="filter" size={16} color={c.text} />
             <Text style={[styles.filterText, { color: c.text }]}>Фильтр</Text>
          </View>
       </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Spinner fullScreen text="Загрузка карты..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <FlatList
          data={data?.data || []}
          keyExtractor={(item) => item.chef_id.toString()}
          ListHeaderComponent={
            <View>
              <MapPlaceholder />
              <Text style={[styles.sectionTitle, { color: c.text }]}>
                Повара рядом
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ChefCard chef={item} onPress={() => handleChefPress(item)} />
            </View>
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={c.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👨‍🍳</Text>
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>
                Повара не найдены
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
};

export default ChefsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 20 },
  cardWrapper: { paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold", // Using Serif font would be better if available, but bold is safe
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 12,
    fontFamily: "System", // System font
  },
  mapContainer: {
    height: WINDOW_HEIGHT * 0.45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    position: 'relative'
  },
  mapMapbox: {
    alignItems: 'center',
    gap: 8
  },
  mapText: {
    fontSize: 18,
    fontWeight: "500"
  },
  mapSubText: {
    fontSize: 14,
    opacity: 0.7
  },
  filterButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600"
  },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16 },
});
