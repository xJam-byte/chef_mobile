/**
 * Badge component (theme-aware)
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "../../lib/theme";

interface BadgeProps {
  text: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = "default",
  size = "md",
  style,
}) => {
  const c = useColors();

  const getBg = () => {
    switch (variant) {
      case "success":
        return c.success + "20";
      case "warning":
        return c.warning + "20";
      case "error":
        return c.error + "20";
      case "info":
        return c.info + "20";
      default:
        return c.pillBg;
    }
  };

  const getText = () => {
    switch (variant) {
      case "success":
        return c.success;
      case "warning":
        return c.warning;
      case "error":
        return c.error;
      case "info":
        return c.info;
      default:
        return c.text;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        size === "sm" ? styles.badgeSm : null,
        { backgroundColor: getBg() },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === "sm" ? styles.textSm : null,
          { color: getText() },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  textSm: {
    fontSize: 12,
  },
});
