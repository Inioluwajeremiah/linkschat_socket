import { createContext, useContext, ReactNode } from "react";
import { useColorScheme } from "react-native";
import { DarkColors, LightColors } from "../constants";

type ColorScheme = typeof DarkColors;

interface ThemeContextType {
  colors: ColorScheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: DarkColors,
  isDark: true,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme !== "light";
  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
