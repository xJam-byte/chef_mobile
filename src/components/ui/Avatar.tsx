/**
 * Avatar component (theme-aware)
 */

import React from "react";
import { View, Image, Text, StyleSheet, ImageStyle } from "react-native";
import { useColors } from "../../lib/theme";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZES = { sm: 32, md: 48, lg: 64, xl: 96 } as const;
const FONT_SIZES = { sm: 14, md: 18, lg: 24, xl: 36 } as const;

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = "md" }) => {
  const c = useColors();
  const dimension = SIZES[size];
  const fontSize = FONT_SIZES[size];

  const getInitials = () => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const imageStyle: ImageStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    backgroundColor: c.border,
  };

  if (uri) {
    return <Image source={{ uri }} style={imageStyle} />;
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: c.primary + "20",
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize, color: c.primary }]}>
        {getInitials()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: "800",
  },
});
