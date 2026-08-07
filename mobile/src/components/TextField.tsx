import { Text, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ marginBottom: spacing.xs, color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[
          {
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            borderRadius: 12,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + 2,
            fontSize: 16,
            color: colors.textPrimary,
            backgroundColor: colors.surface,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={{ marginTop: spacing.xs, color: colors.danger, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}
