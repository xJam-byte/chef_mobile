/**
 * Input component (theme-aware)
 */

import React from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { useColors } from "../../lib/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style, // Добавляем style в деструктуризацию, чтобы отделить от ...props
  ...props
}) => {
  const c = useColors();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: c.text }]}>{label}</Text>}

      <TextInput
        {...props}
        style={[
          styles.input,
          {
            backgroundColor: c.surface,
            borderColor: error ? c.error : c.border,
            color: c.text,
          },
          style, // Теперь внешние стили имеют приоритет
        ]}
        placeholderTextColor={c.textMuted}
      />

      {error && <Text style={[styles.error, { color: c.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
  },
});
