import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
    { value: 'Breakfast', label: t('mealType.breakfast') },
    { value: 'Lunch', label: t('mealType.lunchShort') },
    { value: 'Dinner', label: t('mealType.dinnerShort') },
    { value: 'Snack', label: t('mealType.snack') },
  ];

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
    <Screen edges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, marginBottom: spacing.sm }}
      >
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        <Text style={{ color: colors.textPrimary, fontSize: 16 }}>{t('common.back')}</Text>
      </Pressable>

      {foodQuery.isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : !foodQuery.data ? (
        <Text style={{ color: colors.textSecondary }}>{t('foodDetail.notFound')}</Text>
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
              label={t('foodDetail.quantity')}
              keyboardType="decimal-pad"
              value={quantity}
              onChangeText={setQuantity}
              error={!isQuantityValid ? t('foodDetail.invalidQuantity') : undefined}
            />

            <Text style={{ color: colors.textSecondary, marginBottom: spacing.xs, fontSize: 13, fontWeight: '600' }}>
              {t('foodDetail.meal')}
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
              <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
                {getApiErrorMessage(addMutation.error, t)}
              </Text>
            ) : null}

            <Button
              title={isQuantityValid ? t('foodDetail.addToDiaryWithKcal', { kcal: previewCalories }) : t('foodDetail.addToDiary')}
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
            <Text style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>{t('foodDetail.per100g')}</Text>
            <Row label={t('foodDetail.calories')} value={`${foodQuery.data.caloriesPer100g} kcal`} />
            <Row label={t('foodDetail.protein')} value={`${foodQuery.data.proteinPer100g} g`} />
            <Row label={t('foodDetail.carb')} value={`${foodQuery.data.carbPer100g} g`} />
            <Row label={t('foodDetail.fat')} value={`${foodQuery.data.fatPer100g} g`} />
            {foodQuery.data.fiberPer100g != null && <Row label={t('foodDetail.fiber')} value={`${foodQuery.data.fiberPer100g} g`} />}
            {foodQuery.data.sugarPer100g != null && <Row label={t('foodDetail.sugar')} value={`${foodQuery.data.sugarPer100g} g`} />}
            {foodQuery.data.sodiumMgPer100g != null && (
              <Row label={t('foodDetail.sodium')} value={`${foodQuery.data.sodiumMgPer100g} mg`} />
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
              <Text style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>{t('foodDetail.micronutrients')}</Text>
              {foodQuery.data.micronutrients.map((m) => (
                <Row
                  key={m.nutrientCode}
                  label={t(`nutrients.${m.nutrientCode}`, { defaultValue: m.nutrientCode })}
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
