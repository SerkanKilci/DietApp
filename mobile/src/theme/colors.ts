export const palette = {
  primary: '#22A559',
  primaryDark: '#3DD874',
  protein: '#3B82F6',
  carb: '#F59E0B',
  fat: '#A855F7',
  danger: '#EF4444',
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  protein: string;
  carb: string;
  fat: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F6F8',
  border: '#E4E7EB',
  textPrimary: '#14181F',
  textSecondary: '#6B7280',
  primary: palette.primary,
  protein: palette.protein,
  carb: palette.carb,
  fat: palette.fat,
  danger: palette.danger,
};

export const darkColors: ThemeColors = {
  background: '#0F1115',
  surface: '#1B1F26',
  border: '#2B3038',
  textPrimary: '#F2F4F7',
  textSecondary: '#9AA2AD',
  primary: palette.primaryDark,
  protein: palette.protein,
  carb: palette.carb,
  fat: palette.fat,
  danger: palette.danger,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
