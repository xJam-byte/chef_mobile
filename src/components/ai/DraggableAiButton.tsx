import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const BUTTON_SIZE = 60;

interface Props {
  onPress: () => void;
}

export function DraggableAiButton({ onPress }: Props) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const pan = useRef(new Animated.ValueXY({ x: WINDOW_WIDTH - BUTTON_SIZE - 20, y: WINDOW_HEIGHT - 150 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        setIsDragging(false);
        
        // Snap to nearest edge logic could go here, but free movement is requested
        // Constrain to screen
        // (Implementation omitted for brevity, but recommended for polish)
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (!isDragging) onPress();
        }}
        style={[styles.button, { backgroundColor: c.name === 'light' ? '#FFFFFF' : '#1A1A1A' }]}
      >
        <Image
            source={require("../../images/Capo.png")}
            style={styles.avatar}
            resizeMode="contain"
        />
        <View style={styles.badge}>
            <Ionicons name="sparkles" size={10} color="#000" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 9999, // On top of everything
    top: 0,
    left: 0,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  avatar: {
    width: "80%",
    height: "80%",
    borderRadius: BUTTON_SIZE / 2,
  },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#FFD700",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  }
});
