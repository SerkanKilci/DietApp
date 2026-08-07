import { Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { NutritionGoalDto } from '@/api/types';

function MacroRow({ label, grams, color }: { label: string; grams: number; color: string }) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: spacing.sm }} />
      <Text style={{ flex: 1, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{grams} g</Text>
    </View>
  );
}

export function NutritionGoalCard({ goal }: { goal: NutritionGoalDto }) {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={{
        marginTop: spacing.lg,
        padding: spacing.md,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: colors.textSecondary }}>Günlük hedef</Text>
      <Text style={{ fontSize: 32, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.xs }}>
        {goal.dailyCalories} <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textSecondary }}>kcal</Text>
      </Text>

      <MacroRow label="Protein" grams={goal.proteinG} color={colors.protein} />
      <MacroRow label="Karbonhidrat" grams={goal.carbG} color={colors.carb} />
      <MacroRow label="Yağ" grams={goal.fatG} color={colors.fat} />
    </View>
  );
}
