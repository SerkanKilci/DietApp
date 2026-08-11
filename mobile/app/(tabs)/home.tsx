import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { MacroRingsCard } from '@/components/MacroRingsCard';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useDailySummary, dailySummaryQueryKey } from '@/hooks/useDailySummary';
import { mealApi } from '@/api/mealApi';
import { MealGroupDto, MealType } from '@/api/types';
import { todayDateString } from '@/utils/date';

function useMealTypeLabels(): Record<MealType, string> {
  const { t } = useTranslation();
  return {
    Breakfast: t('mealType.breakfast'),
    Lunch: t('mealType.lunchFull'),
    Dinner: t('mealType.dinnerFull'),
    Snack: t('mealType.snack'),
  };
}

function MealSection({ group, onDeleteItem }: { group: MealGroupDto; onDeleteItem: (id: string) => void }) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const mealTypeLabels = useMealTypeLabels();

  return (
    <View style={{ marginTop: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.xs }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 15 }}>{mealTypeLabels[group.mealType]}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{Math.round(group.totalCalories)} kcal</Text>
      </View>

      {group.items.length === 0 ? (
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{t('home.notAdded')}</Text>
      ) : (
        group.items.map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.foodName}</Text>
                {item.isAiEstimated ? (
                  <View
                    style={{
                      marginLeft: spacing.xs,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: 6,
                      backgroundColor: colors.primary + '22',
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>{t('home.aiTag')}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 1 }}>
                {item.isAiEstimated ? t('home.aiEstimateLabel') : `${item.quantityG} g`} · {Math.round(item.caloriesTotal)} kcal
              </Text>
            </View>
            <Pressable onPress={() => onDeleteItem(item.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const today = todayDateString();

  const summaryQuery = useDailySummary(today);

  const deleteMutation = useMutation({
    mutationFn: mealApi.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailySummaryQueryKey(today) });
    },
  });

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
          {t('home.greeting')}{user ? `, ${user.displayName}` : ''}
        </Text>
        <Pressable
          onPress={() => router.push('/scan')}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {summaryQuery.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : !summaryQuery.data ? (
        <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' }}>
            {t('home.loadFailed')}
          </Text>
          <Button title={t('common.retry')} variant="secondary" onPress={() => summaryQuery.refetch()} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: spacing.md }}>
          <MacroRingsCard summary={summaryQuery.data} />

          {summaryQuery.data.meals.map((group) => (
            <MealSection key={group.mealType} group={group} onDeleteItem={(id) => deleteMutation.mutate(id)} />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
