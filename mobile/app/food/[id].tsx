import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/theme/ThemeProvider';
import { foodApi } from '@/api/foodApi';
import { mealApi } from '@/api/mealApi';
import { dailySummaryQueryKey } from '@/hooks/useDailySummary';
import { MealType } from '@/api/types';
import { guessMealTypeByTime, todayDateString } from '@/utils/date';
import { getApiErrorMessage } from '@/utils/apiError';

const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'Breakfast', label: 'Kahvaltı' },
  { value: 'Lunch', label: 'Öğle' },
  { value: 'Dinner', label: 'Akşam' },
  { value: 'Snack', label: 'Ara öğün' },
];

const NUTRIENT_LABELS: Record<string, string> = {
  CALCIUM: 'Kalsiyum',
  IRON: 'Demir',
  POTASSIUM: 'Potasyum',
  MAGNESIUM: 'Magnezyum',
  ZINC: 'Çinko',
  VITAMIN_C: 'Vitamin C',
  VITAMIN_A: 'Vitamin A',
  VITAMIN_D: 'Vitamin D',
  VITAMIN_B12: 'Vitamin B12',
};

function Row({ label, value }: { label: string; value: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ color: colors.textSecondary }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState('100');
  const [mealType, setMealType] = useState<MealType>(guessMealTypeByTime());

  const foodQuery = useQuery({
    queryKey: ['foods', id],
    queryFn: () => foodApi.getById(id),
    enabled: Boolean(id),
  });

  const addMutation = useMutation({
    mutationFn: mealApi.addItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailySummaryQueryKey(todayDateString()) });
      router.replace('/home');
    },
  });

  const quantityNumber = Number(quantity);
  const isQuantityValid = quantityNumber > 0 && !Number.isNaN(quantityNumber);
  const previewCalories =
    isQuantityValid && foodQuery.data ? Math.round((foodQuery.data.caloriesPer100g * quantityNumber) / 100) : 0;

  const handleAdd = () => {
    if (!foodQuery.data || !isQuantityValid) {
      return;
    }

    addMutation.mutate({
      logDate: todayDateString(),
      mealType,
      foodItemId: foodQuery.data.id,
      quantityG: quantityNumber,
    });
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Geri</Text>
      </Pressable>

      {foodQuery.isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : !foodQuery.data ? (
        <Text style={{ color: colors.textSecondary }}>Besin bulunamadı.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary }}>{foodQuery.data.name}</Text>
          {foodQuery.data.brand ? (
            <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{foodQuery.data.brand}</Text>
          ) : null}

          <View
            style={{
              marginTop: spacing.md,
              padding: spacing.md,
              borderRadius: 16,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TextField
              label="Miktar (g)"
              keyboardType="decimal-pad"
              value={quantity}
              onChangeText={setQuantity}
              error={!isQuantityValid ? 'Geçerli bir miktar gir' : undefined}
            />

            <Text style={{ color: colors.textSecondary, marginBottom: spacing.xs, fontSize: 13, fontWeight: '600' }}>
              Öğün
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
              {MEAL_TYPE_OPTIONS.map((option) => {
                const selected = mealType === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setMealType(option.value)}
                    style={{
                      paddingVertical: spacing.xs + 2,
                      paddingHorizontal: spacing.sm + 2,
                      borderRadius: 999,
                      backgroundColor: selected ? colors.primary : colors.background,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                    }}
                  >
                    <Text style={{ color: selected ? '#FFFFFF' : colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {addMutation.isError ? (
              <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>{getApiErrorMessage(addMutation.error)}</Text>
            ) : null}

            <Button
              title={isQuantityValid ? `Günlüğe ekle (${previewCalories} kcal)` : 'Günlüğe ekle'}
              disabled={!isQuantityValid}
              loading={addMutation.isPending}
              onPress={handleAdd}
            />
          </View>

          <View
            style={{
              marginTop: spacing.md,
              padding: spacing.md,
              borderRadius: 16,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>100g başına</Text>
            <Row label="Kalori" value={`${foodQuery.data.caloriesPer100g} kcal`} />
            <Row label="Protein" value={`${foodQuery.data.proteinPer100g} g`} />
            <Row label="Karbonhidrat" value={`${foodQuery.data.carbPer100g} g`} />
            <Row label="Yağ" value={`${foodQuery.data.fatPer100g} g`} />
            {foodQuery.data.fiberPer100g != null && <Row label="Lif" value={`${foodQuery.data.fiberPer100g} g`} />}
            {foodQuery.data.sugarPer100g != null && <Row label="Şeker" value={`${foodQuery.data.sugarPer100g} g`} />}
            {foodQuery.data.sodiumMgPer100g != null && (
              <Row label="Sodyum" value={`${foodQuery.data.sodiumMgPer100g} mg`} />
            )}
          </View>

          {foodQuery.data.micronutrients.length > 0 && (
            <View
              style={{
                marginTop: spacing.md,
                padding: spacing.md,
                borderRadius: 16,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>Mikro besinler (100g)</Text>
              {foodQuery.data.micronutrients.map((m) => (
                <Row
                  key={m.nutrientCode}
                  label={NUTRIENT_LABELS[m.nutrientCode] ?? m.nutrientCode}
                  value={`${m.amountPer100g} ${m.unit.toLowerCase()}`}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
