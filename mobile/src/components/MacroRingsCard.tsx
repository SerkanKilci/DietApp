import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeProvider';
import { DailySummaryDto } from '@/api/types';
import { RingProgress } from './RingProgress';

function MacroRingItem({ label, consumed, goal, color }: { label: string; consumed: number; goal: number; color: string }) {
  const { colors } = useTheme();
  const progress = goal > 0 ? consumed / goal : 0;

  return (
    <View style={{ alignItems: 'center' }}>
      <View>
        <RingProgress size={64} strokeWidth={7} progress={progress} color={color} trackColor={colors.border} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>{Math.round(consumed)}</Text>
        </View>
      </View>
      <Text style={{ marginTop: 6, color: colors.textPrimary, fontSize: 13, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
        {Math.round(consumed)}/{goal}g
      </Text>
    </View>
  );
}

export function MacroRingsCard({ summary }: { summary: DailySummaryDto }) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const calorieProgress = summary.calorieGoal > 0 ? summary.consumedCalories / summary.calorieGoal : 0;
  const remaining = Math.round(summary.remainingCalories);

  return (
    <View
      style={{
        padding: spacing.md,
        borderRadius: 16,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <View>
          <RingProgress size={160} strokeWidth={14} progress={calorieProgress} color={colors.primary} trackColor={colors.border} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 30, fontWeight: '700', color: colors.textPrimary }}>
              {remaining < 0 ? `+${Math.abs(remaining)}` : remaining}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {remaining < 0 ? t('home.kcalOver') : t('home.kcalRemaining')}
            </Text>
          </View>
        </View>
        <Text style={{ marginTop: spacing.sm, color: colors.textSecondary, fontSize: 12 }}>
          {Math.round(summary.consumedCalories)} / {summary.calorieGoal} kcal
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.lg }}>
        <MacroRingItem label={t('macros.protein')} consumed={summary.consumedProtein} goal={summary.proteinGoal} color={colors.protein} />
        <MacroRingItem label={t('macros.carb')} consumed={summary.consumedCarb} goal={summary.carbGoal} color={colors.carb} />
        <MacroRingItem label={t('macros.fat')} consumed={summary.consumedFat} goal={summary.fatGoal} color={colors.fat} />
      </View>
    </View>
  );
}
