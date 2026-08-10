import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/theme/ThemeProvider';
import { profileApi } from '@/api/profileApi';
import { profileQueryKey, useProfile } from '@/hooks/useProfile';
import { getApiErrorMessage } from '@/utils/apiError';

export default function EditGoalsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profileQuery = useProfile(true);

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carb, setCarb] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (!prefilled && profileQuery.data) {
      const g = profileQuery.data.nutritionGoal;
      setCalories(String(g.dailyCalories));
      setProtein(String(g.proteinG));
      setCarb(String(g.carbG));
      setFat(String(g.fatG));
      setPrefilled(true);
    }
  }, [profileQuery.data, prefilled]);

  const mutation = useMutation({
    mutationFn: profileApi.setCustomNutritionGoal,
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey, profile);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/home');
      }
    },
  });

  const caloriesFromMacros = (Number(protein) || 0) * 4 + (Number(carb) || 0) * 4 + (Number(fat) || 0) * 9;

  const handleSave = () => {
    setError(null);
    const dailyCalories = Number(calories);
    const proteinG = Number(protein);
    const carbG = Number(carb);
    const fatG = Number(fat);

    if (!dailyCalories || dailyCalories < 800 || dailyCalories > 6000) {
      setError('Günlük kalori 800-6000 aralığında olmalı.');
      return;
    }
    if ([proteinG, carbG, fatG].some((v) => Number.isNaN(v) || v < 0)) {
      setError('Makro değerleri geçerli, negatif olmayan sayılar olmalı.');
      return;
    }

    mutation.mutate({ dailyCalories, proteinG, carbG, fatG });
  };

  if (profileQuery.isLoading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}
      >
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Geri</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs }}>
          Hedeflerini elle ayarla
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          Kendi diyet programını oluştur — otomatik hesaplanan değerler yerine kendi hedeflerini gir.
        </Text>

        <TextField label="Günlük kalori (kcal)" keyboardType="number-pad" value={calories} onChangeText={setCalories} />
        <TextField label="Protein (g)" keyboardType="number-pad" value={protein} onChangeText={setProtein} />
        <TextField label="Karbonhidrat (g)" keyboardType="number-pad" value={carb} onChangeText={setCarb} />
        <TextField label="Yağ (g)" keyboardType="number-pad" value={fat} onChangeText={setFat} />

        <View
          style={{
            padding: spacing.sm,
            borderRadius: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Girdiğin makrolardan hesaplanan kalori: {Math.round(caloriesFromMacros)} kcal
          </Text>
        </View>

        {error ? <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>{error}</Text> : null}
        {mutation.isError ? (
          <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>{getApiErrorMessage(mutation.error)}</Text>
        ) : null}

        <Button title="Kaydet" loading={mutation.isPending} onPress={handleSave} />
      </ScrollView>
    </Screen>
  );
}
