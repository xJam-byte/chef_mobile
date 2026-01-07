/**
 * Chef Detail Screen (theme-aware)
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Avatar, StarRating, Spinner, Card } from "../../components/ui";
import { DishCard } from "../../components/features";
import { useChef, useChefDishes } from "../../lib/hooks";
import { API_BASE_URL } from "../../lib/constants";
import type { RootStackScreenProps } from "../../navigation/types";
import { useColors } from "../../lib/theme";

const ChefDetailScreen = ({
  route,
  navigation,
}: RootStackScreenProps<"ChefDetail">) => {
  const c = useColors();
  // Исправлено: берем chefId напрямую
  const { chefId } = route.params;

  const { data: chef, isLoading: isLoadingChef } = useChef(chefId);
  const { data: dishes, isLoading: isLoadingDishes } = useChefDishes(chefId);

  if (isLoadingChef) return <Spinner fullScreen />;

  if (!chef) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: c.background }]}>
        <Text style={[styles.errorText, { color: c.textSecondary }]}>
          Повар не найден
        </Text>
      </View>
    );
  }

  const avatarUri = chef.user?.profile_pic
    ? chef.user.profile_pic.startsWith("http")
      ? chef.user.profile_pic
      : `${API_BASE_URL}${chef.user.profile_pic}`
    : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Card style={styles.headerCard}>
        <View style={styles.header}>
          <Avatar uri={avatarUri} name={chef.user?.name} size="xl" />
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: c.text }]}>
              {chef.user?.name || "Шеф-повар"}
            </Text>
            <StarRating rating={chef.rating} size={18} />
            {chef.user?.phone_number && (
              <Text style={[styles.phone, { color: c.textSecondary }]}>
                {chef.user.phone_number}
              </Text>
            )}
          </View>
        </View>

        {chef.bio ? (
          <Text
            style={[
              styles.bio,
              { color: c.textSecondary, borderTopColor: c.divider },
            ]}
          >
            {chef.bio}
          </Text>
        ) : null}
      </Card>

      <View style={styles.dishesSection}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          Блюда ({dishes?.total || 0})
        </Text>

        {isLoadingDishes ? (
          <Spinner />
        ) : dishes?.data && dishes.data.length > 0 ? (
          <View>
            {dishes.data.map((dish: any) => (
              <DishCard
                key={dish.dish_id}
                dish={dish}
                onPress={() =>
                  navigation.navigate("DishDetail", { dishId: dish.dish_id })
                }
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyDishes}>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Повар пока не добавил блюда
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

export default ChefDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16 },

  headerCard: { margin: 16 },
  header: { flexDirection: "row", alignItems: "center" },
  headerInfo: { flex: 1, marginLeft: 16 },

  name: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  phone: { fontSize: 14, marginTop: 8 },

  bio: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },

  dishesSection: { padding: 16, paddingTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },

  emptyDishes: { alignItems: "center", paddingVertical: 32 },
  emptyText: { fontSize: 16 },

  bottomPadding: { height: 32 },
});
