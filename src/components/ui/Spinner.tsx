/**
 * Spinner/Loading component (theme-aware)
 */

import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useColors } from "../../lib/theme";

interface SpinnerProps {
  fullScreen?: boolean;
  size?: "small" | "large";
  color?: string;
  text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  fullScreen = false,
  size = "large",
  color,
  text,
}) => {
  const c = useColors();
  const spinnerColor = color ?? c.primary;

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: c.background }]}>
        <ActivityIndicator size={size} color={spinnerColor} />
        {text && (
          <Text style={[styles.text, { color: c.textSecondary }]}>{text}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && (
        <Text style={[styles.text, { color: c.textSecondary }]}>{text}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 12,
    fontSize: 14,
  },
});
