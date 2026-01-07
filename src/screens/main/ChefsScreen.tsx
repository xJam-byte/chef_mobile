/**
 * Chefs Screen - List of chefs
 */

import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChefCard } from "../../components/features";
import { Spinner } from "../../components/ui";
import { useChefs } from "../../lib/hooks";
import { useColors } from "../../lib/theme";
import type { Chef } from "../../lib/types";
import type { RootStackScreenProps } from "../../navigation/types";

const ChefsScreen = () => {
  const c = useColors();
  const navigation =
    useNavigation<RootStackScreenProps<"Main">["navigation"]>();

  const { data, isLoading, isRefetching, refetch } = useChefs({
    page: 1,
    limit: 50,
  });

  const handleChefPress = (chef: Chef) => {
    navigation.navigate("ChefDetail", {
      chefId: chef.chef_id,
    });
  };

  if (isLoading) {
    return <Spinner fullScreen text="Загрузка поваров..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.chef_id.toString()}
        renderItem={({ item }) => (
          <ChefCard chef={item} onPress={() => handleChefPress(item)} />
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
              Повара пока не зарегистрированы
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ChefsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16 },
});
