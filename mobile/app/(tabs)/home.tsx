import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/Screen';
import { MacroRingsCard } from '@/components/MacroRingsCard';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useDailySummary, dailySummaryQueryKey } from '@/hooks/useDailySummary';
import { mealApi } from '@/api/mealApi';
import { MealGroupDto, MealType } from '@/api/types';
import { todayDateString } from '@/utils/date';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  Breakfast: 'Kahvaltı',
  Lunch: 'Öğle Yemeği',
  Dinner: 'Akşam Yemeği',
  Snack: 'Ara Öğün',
};

function MealSection({ group, onDeleteItem }: { group: MealGroupDto; onDeleteItem: (id: string) => void }) {
  const { colors, spacing } = useTheme();

  return (
    <View style={{ marginTop: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.xs }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 15 }}>{MEAL_TYPE_LABELS[group.mealType]}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{Math.round(group.totalCalories)} kcal</Text>
      </View>

      {group.items.length === 0 ? (
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Henüz bir şey eklenmedi.</Text>
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
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.foodName}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 1 }}>
                {item.quantityG} g · {Math.round(item.caloriesTotal)} kcal
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
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
        Merhaba{user ? `, ${user.displayName}` : ''}
      </Text>

      {summaryQuery.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : !summaryQuery.data ? (
        <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Günlük özet yüklenemedi.</Text>
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
