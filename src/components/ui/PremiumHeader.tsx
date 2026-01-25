import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "../../lib/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PremiumHeaderProps {
  title?: string;
  subtitle?: string;
  backButton?: boolean;
  rightElement?: React.ReactNode;
  children?: React.ReactNode; // For custom content like SearchBar
  compact?: boolean;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({ 
  title, 
  subtitle, 
  backButton, 
  rightElement,
  children,
  compact = false
}) => {
  const c = useColors();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={c.authGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
            styles.gradient, 
            { paddingTop: insets.top + (compact ? 10 : 20), paddingBottom: compact ? 16 : 24 }
        ]}
      >
        <View style={styles.contentRow}>
            {/* Left / Back Button */}
            <View style={styles.leftContainer}>
                {backButton && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Title / Center */}
            {title && (
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            )}

            {/* Right Element */}
            <View style={styles.rightContainer}>
                {rightElement}
            </View>
        </View>

        {children && <View style={styles.childrenContainer}>{children}</View>}
        
        {/* Decorative Circle */}
        <View style={[styles.decoration, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // overflow: 'hidden', // Can't overflow because of absolute decoration? No, we want it clipped or not?
    // Let's border radius bottom
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 100,
  },
  gradient: {
    paddingHorizontal: 20,
    position: 'relative',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  leftContainer: {
    width: 48,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 48,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  titleCompact: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childrenContainer: {
      marginTop: 16,
      zIndex: 2,
  },
  decoration: {
      position: 'absolute',
      right: -30,
      top: -30,
      width: 150,
      height: 150,
      borderRadius: 75,
      zIndex: 1,
  }
});
