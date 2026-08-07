import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({ label, description, selected, onPress }: OptionCardProps) {
  const { colors, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 2,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: spacing.md,
        marginBottom: spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>{label}</Text>
          {description ? (
            <Text style={{ marginTop: 2, color: colors.textSecondary, fontSize: 13 }}>{description}</Text>
          ) : null}
        </View>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : 'transparent',
          }}
        />
      </View>
    </Pressable>
  );
}
