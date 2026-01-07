/**
 * Card component (theme-aware)
 */

import React from "react";
import { View, StyleSheet, ViewStyle, ViewProps } from "react-native";
import { useColors, useTheme } from "../../lib/theme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = "md",
  ...props
}) => {
  const c = useColors();
  const { theme } = useTheme();

  const pad =
    padding === "none" ? 0 : padding === "sm" ? 12 : padding === "lg" ? 24 : 16;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.card,
          padding: pad,
          borderColor: c.border,
          borderWidth: 1,
          // чуть мягче в dark
          shadowOpacity: theme.name === "dark" ? 0.18 : 0.08,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 4,
  },
});
