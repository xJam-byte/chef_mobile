/**
 * Custom Button component (theme-aware)
 */

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { useColors } from "../../lib/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const c = useColors();

  const height = size === "sm" ? 40 : size === "lg" ? 54 : 48;
  const fontSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  const padH = size === "sm" ? 16 : size === "lg" ? 22 : 18;

  const bg =
    variant === "primary"
      ? c.primary
      : variant === "secondary"
      ? c.secondary
      : variant === "danger"
      ? c.error
      : "transparent";

  const borderWidth = variant === "outline" ? 2 : 0;
  const borderColor = variant === "outline" ? c.primary : "transparent";

  const textColor = variant === "outline" ? c.primary : "#FFFFFF";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          height,
          paddingHorizontal: padH,
          backgroundColor: bg,
          borderWidth,
          borderColor,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "800",
  },
});
