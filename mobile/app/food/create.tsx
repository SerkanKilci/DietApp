import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/theme/ThemeProvider';
import { foodApi } from '@/api/foodApi';
import { getApiErrorMessage } from '@/utils/apiError';

type FormValues = {
  name: string;
  brand?: string;
  caloriesPer100g: string;
  proteinPer100g: string;
  carbPer100g: string;
  fatPer100g: string;
  fiberPer100g?: string;
  sugarPer100g?: string;
  sodiumMgPer100g?: string;
};

export default function CreateFoodScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const schema = useMemo(() => {
    const requiredNumberString = z
      .string()
      .min(1, t('validation.fieldRequired'))
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, t('validation.validNonNegativeNumber'));

    return z.object({
      name: z.string().trim().min(1, t('validation.fieldRequired')),
      brand: z.string().trim().optional(),
      caloriesPer100g: requiredNumberString,
      proteinPer100g: requiredNumberString,
      carbPer100g: requiredNumberString,
      fatPer100g: requiredNumberString,
      fiberPer100g: z.string().optional(),
      sugarPer100g: z.string().optional(),
      sodiumMgPer100g: z.string().optional(),
    });
  }, [t]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      brand: '',
      caloriesPer100g: '',
      proteinPer100g: '',
      carbPer100g: '',
      fatPer100g: '',
      fiberPer100g: '',
      sugarPer100g: '',
      sodiumMgPer100g: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: foodApi.createCustom,
    onSuccess: (food) => {
      queryClient.invalidateQueries({ queryKey: ['foods', 'search'] });
      router.replace(`/food/${food.id}`);
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      name: values.name,
      brand: values.brand ? values.brand : null,
      caloriesPer100g: Number(values.caloriesPer100g),
      proteinPer100g: Number(values.proteinPer100g),
      carbPer100g: Number(values.carbPer100g),
      fatPer100g: Number(values.fatPer100g),
      fiberPer100g: values.fiberPer100g ? Number(values.fiberPer100g) : null,
      sugarPer100g: values.sugarPer100g ? Number(values.sugarPer100g) : null,
      sodiumMgPer100g: values.sodiumMgPer100g ? Number(values.sodiumMgPer100g) : null,
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
          {t('foodCreate.title')}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>{t('foodCreate.subtitle')}</Text>

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField label={t('foodCreate.name')} value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
          )}
        />

        <Controller
          control={control}
          name="brand"
          render={({ field }) => (
            <TextField label={t('foodCreate.brand')} value={field.value} onChangeText={field.onChange} />
          )}
        />

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="caloriesPer100g"
              render={({ field }) => (
                <TextField
                  label={t('foodCreate.calories')}
                  keyboardType="decimal-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.caloriesPer100g?.message}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="proteinPer100g"
              render={({ field }) => (
                <TextField
                  label={t('foodCreate.protein')}
                  keyboardType="decimal-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.proteinPer100g?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="carbPer100g"
              render={({ field }) => (
                <TextField
                  label={t('foodCreate.carb')}
                  keyboardType="decimal-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.carbPer100g?.message}
                />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="fatPer100g"
              render={({ field }) => (
                <TextField
                  label={t('foodCreate.fat')}
                  keyboardType="decimal-pad"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.fatPer100g?.message}
                />
              )}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="fiberPer100g"
              render={({ field }) => (
                <TextField label={t('foodCreate.fiber')} keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="sugarPer100g"
              render={({ field }) => (
                <TextField label={t('foodCreate.sugar')} keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="sodiumMgPer100g"
          render={({ field }) => (
            <TextField label={t('foodCreate.sodium')} keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} />
          )}
        />

        {createMutation.isError ? (
          <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
            {getApiErrorMessage(createMutation.error, t)}
          </Text>
        ) : null}

        <Button title={t('common.save')} loading={createMutation.isPending} onPress={handleSubmit(onSubmit)} />
      </ScrollView>
    </Screen>
  );
}
