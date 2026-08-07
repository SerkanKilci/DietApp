import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { z } from 'zod';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/theme/ThemeProvider';
import { foodApi } from '@/api/foodApi';
import { getApiErrorMessage } from '@/utils/apiError';

const requiredNumberString = z
  .string()
  .min(1, 'Bu alan gerekli')
  .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Geçerli, negatif olmayan bir sayı gir');

const schema = z.object({
  name: z.string().trim().min(1, 'İsim gerekli'),
  brand: z.string().trim().optional(),
  caloriesPer100g: requiredNumberString,
  proteinPer100g: requiredNumberString,
  carbPer100g: requiredNumberString,
  fatPer100g: requiredNumberString,
  fiberPer100g: z.string().optional(),
  sugarPer100g: z.string().optional(),
  sodiumMgPer100g: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateFoodScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

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
    <Screen>
      <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Geri</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
          Kendi yemeğini ekle
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          Değerleri 100 gram için gir.
        </Text>

        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField label="İsim" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
          )}
        />

        <Controller
          control={control}
          name="brand"
          render={({ field }) => (
            <TextField label="Marka (opsiyonel)" value={field.value} onChangeText={field.onChange} />
          )}
        />

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="caloriesPer100g"
              render={({ field }) => (
                <TextField
                  label="Kalori (kcal)"
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
                  label="Protein (g)"
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
                  label="Karbonhidrat (g)"
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
                  label="Yağ (g)"
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
                <TextField label="Lif (g)" keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} />
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="sugarPer100g"
              render={({ field }) => (
                <TextField label="Şeker (g)" keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="sodiumMgPer100g"
          render={({ field }) => (
            <TextField label="Sodyum (mg)" keyboardType="decimal-pad" value={field.value} onChangeText={field.onChange} />
          )}
        />

        {createMutation.isError ? (
          <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>{getApiErrorMessage(createMutation.error)}</Text>
        ) : null}

        <Button title="Kaydet" loading={createMutation.isPending} onPress={handleSubmit(onSubmit)} />
      </ScrollView>
    </Screen>
  );
}
