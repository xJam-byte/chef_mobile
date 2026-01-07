/**
 * Star Rating component (theme-aware)
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  showValue = true,
  interactive = false,
  onRatingChange,
}) => {
  const c = useColors();

  const renderStar = (index: number) => {
    const fillPercentage = Math.min(Math.max(rating - index, 0), 1);

    const starElement = (
      <View key={index} style={styles.starContainer}>
        <Ionicons name="star-outline" size={size} color={c.warning} />
        <View style={[styles.starFill, { width: `${fillPercentage * 100}%` }]}>
          <Ionicons name="star" size={size} color={c.warning} />
        </View>
      </View>
    );

    if (interactive && onRatingChange) {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => onRatingChange(index + 1)}
          activeOpacity={0.7}
        >
          {starElement}
        </TouchableOpacity>
      );
    }

    return starElement;
  };

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
      </View>
      {showValue && (
        <Text style={[styles.value, { color: c.text }]}>
          {Number(rating ?? 0).toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center" },
  stars: { flexDirection: "row" },
  starContainer: { position: "relative", marginRight: 2 },
  starFill: { position: "absolute", top: 0, left: 0, overflow: "hidden" },
  value: { marginLeft: 8, fontSize: 14, fontWeight: "700" },
});
