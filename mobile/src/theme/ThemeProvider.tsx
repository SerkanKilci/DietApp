import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useThemeStore } from '@/store/themeStore';
import { darkColors, lightColors, spacing, ThemeColors } from './colors';

interface ThemeContextValue {
  colors: ThemeColors;
  spacing: typeof spacing;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);

  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      spacing,
      isDark,
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
