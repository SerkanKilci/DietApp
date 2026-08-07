import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ title, loading, variant = 'primary', disabled, ...rest }: ButtonProps) {
  const { colors, spacing } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          paddingVertical: spacing.sm + 4,
          backgroundColor: isPrimary ? colors.primary : 'transparent',
          borderWidth: isPrimary ? 0 : 1,
          borderColor: colors.border,
          opacity: pressed || disabled || loading ? 0.7 : 1,
        },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : colors.textPrimary} />
      ) : (
        <Text style={{ color: isPrimary ? '#FFFFFF' : colors.textPrimary, fontWeight: '600', fontSize: 16 }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
