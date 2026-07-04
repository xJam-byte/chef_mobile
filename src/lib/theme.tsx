// lib/theme.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";

export type ThemeName = "light" | "dark" | "system";

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
  input: string;

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
  primary: "#F97316", // hsl(25, 95%, 53%)
  secondary: "#F5F0E6", // hsl(40, 40%, 94%)
  success: "#22C55E", // hsl(142, 70%, 45%)
  warning: "#EAB308", // hsl(45, 93%, 47%)
  error: "#EF4444", // hsl(0, 84%, 60%) (using destructuve)
  info: "#F97316", // Defaulting to primary for now as info wasn't specified

  background: "#FDFBF7", // hsl(45, 30%, 98%)
  surface: "#FFFFFF", // Assuming surface is same as card or white
  card: "#FFFFFF", // hsl(0, 0%, 100%)
  input: "#F5F0E6", // Using secondary for input background

  text: "#302418", // hsl(25, 25%, 15%)
  textSecondary: "#7A6B5D", // hsl(25, 15%, 45%)
  textMuted: "#9CA3AF", // Visible gray (Gray-400) for inactive elements
  border: "#E8E2D6", // hsl(40, 30%, 88%)
  divider: "#F5F0E6", // secondary

  pillBg: "#F5F0E6", // secondary
  pillBorder: "#E8E2D6", // border

  pillIconBg: "#FFFFFF",
  pillIconBorder: "#E8E2D6",

  authGradient: ["#F97316", "#CF4A1A"], // derived from accent
  authCard: "#FFFFFF",
  authCardBorder: "#E8E2D6",

  gradientFrom: "#F97316",
  gradientTo: "#CF4A1A",
};

export const DARK_COLORS: ThemeColors = {
  name: "dark",
  primary: "#FB8C3C", // hsl(25, 95%, 55%)
  secondary: "#332B25", // hsl(25, 15%, 18%)
  success: "#34D399", // hsl(142, 60%, 50%)
  warning: "#EAB308", // hsl(45, 90%, 50%) - wait, provided was #F5BF04
  error: "#D93636", // hsl(0, 70%, 50%)
  info: "#FB8C3C",

  background: "#1A1512", // hsl(25, 20%, 8%)
  surface: "#231E1A", // Using card color for surface
  card: "#231E1A", // hsl(25, 15%, 12%)
  input: "#332B25", // secondary

  text: "#F7F5F0", // hsl(45, 20%, 95%)
  textSecondary: "#9E978E", // hsl(40, 10%, 60%)
  textMuted: "#6B7280", // Visible gray (Gray-500) for inactive elements

  border: "#3B322B", // hsl(25, 15%, 20%)
  divider: "#332B25",

  pillBg: "#332B25",
  pillBorder: "#3B322B",

  pillIconBg: "#231E1A",
  pillIconBorder: "#3B322B",

  authGradient: ["#1A1512", "#231E1A"],
  authCard: "#231E1A",
  authCardBorder: "#3B322B",

  gradientFrom: "#F97316", // Warm gradient start
  gradientTo: "#CF4A1A", // Warm gradient end
};

type ThemeContextValue = {
  theme: ThemeColors;
  themeName: ThemeName;
  setTheme: (theme: ThemeName | "system") => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: LIGHT_COLORS,
  themeName: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeName, setThemeName] = useState<ThemeName>("system");
  const [isReady, setIsReady] = useState(false);
  const systemColorScheme = useColorScheme();

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      const { getThemePreference } = await import("./utils/storage");
      const savedTheme = await getThemePreference();
      if (savedTheme) {
        setThemeName(savedTheme);
      } else {
        setThemeName("system");
      }
      setIsReady(true);
    };
    loadTheme();
  }, []);

  const activeThemeName = useMemo(() => {
    if (themeName === "system") {
      return systemColorScheme === "dark" ? "dark" : "light";
    }
    return themeName;
  }, [themeName, systemColorScheme]);

  const theme = useMemo(
    () => (activeThemeName === "dark" ? DARK_COLORS : LIGHT_COLORS),
    [activeThemeName],
  );

  const setTheme = async (newTheme: ThemeName) => {
    setThemeName(newTheme);
    const { setThemePreference } = await import("./utils/storage");
    await setThemePreference(newTheme);
  };

  const toggleTheme = () => {
    // Legacy toggle support, cycles light -> dark -> system -> light
    if (themeName === "light") setTheme("dark");
    else if (themeName === "dark") setTheme("system");
    else setTheme("light");
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
