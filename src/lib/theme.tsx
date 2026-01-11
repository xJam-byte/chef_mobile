// lib/theme.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance } from "react-native";

export type ThemeName = "light" | "dark";

export type ThemeColors = {
  name: ThemeName;

  primary: string;
  secondary: string;

  success: string;
  warning: string;
  error: string;
  info: string;

  background: string;
  surface: string;
  card: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  border: string;
  divider: string;

  pillBg: string;
  pillBorder: string;

  // Новые свойства
  pillIconBg: string;
  pillIconBorder: string;

  authGradient: [string, string];
  authCard: string;
  authCardBorder: string;

  // Новые свойства для градиентов
  gradientFrom: string;
  gradientTo: string;
};

export const LIGHT_COLORS: ThemeColors = {
  name: "light",
  primary: "#F97316",
  secondary: "#EA580C",
  success: "#22C55E",
  warning: "#EAB308",
  error: "#EF4444",
  info: "#06B6D4",

  background: "#FFF7ED",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  text: "#1C1917",
  textSecondary: "#78716C",
  textMuted: "#A8A29E",

  border: "#E7E5E4",
  divider: "#F5F5F4",

  pillBg: "#F5F5F4",
  pillBorder: "#E7E5E4",

  pillIconBg: "#FFFFFF",
  pillIconBorder: "#E7E5E4",

  authGradient: ["#F97316", "#EA580C"],
  authCard: "#FFFFFF",
  authCardBorder: "#E7E5E4",

  gradientFrom: "#F97316",
  gradientTo: "#EA580C",
};

export const DARK_COLORS: ThemeColors = {
  name: "dark",
  primary: "#F97316",
  secondary: "#EA580C",
  success: "#22C55E",
  warning: "#EAB308",
  error: "#EF4444",
  info: "#06B6D4",

  background: "#0B1220",
  surface: "#0F172A",
  card: "#111827",

  text: "#F9FAFB",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",

  border: "rgba(255,255,255,0.1)",
  divider: "rgba(255,255,255,0.08)",

  pillBg: "rgba(255,255,255,0.06)",
  pillBorder: "rgba(255,255,255,0.1)",

  pillIconBg: "rgba(255,255,255,0.1)",
  pillIconBorder: "rgba(255,255,255,0.1)",

  authGradient: ["#0F172A", "#111827"],
  authCard: "rgba(255,255,255,0.06)",
  authCardBorder: "rgba(255,255,255,0.1)",

  gradientFrom: "#0F172A",
  gradientTo: "#111827",
};

type ThemeContextValue = {
  theme: ThemeColors;
  themeName: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: LIGHT_COLORS,
  themeName: "light",
  setTheme: () => { },
  toggleTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeName, setThemeName] = useState<ThemeName>("light");
  const [isReady, setIsReady] = useState(false);

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      const { getThemePreference } = await import("./utils/storage");
      const savedTheme = await getThemePreference();
      if (savedTheme) {
        setThemeName(savedTheme);
      } else {
        // Use system preference if no saved theme
        const systemTheme = Appearance.getColorScheme();
        setThemeName(systemTheme === "dark" ? "dark" : "light");
      }
      setIsReady(true);
    };
    loadTheme();
  }, []);

  // Listen to system theme changes only if user hasn't set a preference
  useEffect(() => {
    const sub = Appearance.addChangeListener(async ({ colorScheme }) => {
      const { getThemePreference } = await import("./utils/storage");
      const savedTheme = await getThemePreference();
      if (!savedTheme) {
        setThemeName(colorScheme === "dark" ? "dark" : "light");
      }
    });
    return () => sub.remove();
  }, []);

  const theme = useMemo(
    () => (themeName === "dark" ? DARK_COLORS : LIGHT_COLORS),
    [themeName]
  );

  const setTheme = async (newTheme: ThemeName) => {
    setThemeName(newTheme);
    const { setThemePreference } = await import("./utils/storage");
    await setThemePreference(newTheme);
  };

  const toggleTheme = () => {
    setTheme(themeName === "light" ? "dark" : "light");
  };

  if (!isReady) {
    return null; // or a splash screen
  }

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useTheme().theme;

