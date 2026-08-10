import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/theme/ThemeProvider';
import { aiApi } from '@/api/aiApi';
import { mealApi } from '@/api/mealApi';
import { dailySummaryQueryKey } from '@/hooks/useDailySummary';
import { AnalyzePlateResponse, MealType } from '@/api/types';
import { guessMealTypeByTime, todayDateString } from '@/utils/date';
import { getApiErrorMessage } from '@/utils/apiError';

const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'Breakfast', label: 'Kahvaltı' },
  { value: 'Lunch', label: 'Öğle' },
  { value: 'Dinner', label: 'Akşam' },
  { value: 'Snack', label: 'Ara öğün' },
];

interface PickedAsset {
  uri: string;
  name: string;
  type: string;
  file?: Blob;
}

export default function ScanScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [asset, setAsset] = useState<PickedAsset | null>(null);
  const [result, setResult] = useState<AnalyzePlateResponse | null>(null);
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carb, setCarb] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState<MealType>(guessMealTypeByTime());

  const resetForNewPhoto = () => {
    setAsset(null);
    setResult(null);
  };

  const pickFromPicker = async (pickerResult: ImagePicker.ImagePickerResult) => {
    if (pickerResult.canceled || pickerResult.assets.length === 0) {
      return;
    }

    const picked = pickerResult.assets[0];
    setResult(null);
    setAsset({
      uri: picked.uri,
      name: picked.fileName ?? 'plate.jpg',
      type: picked.mimeType ?? 'image/jpeg',
      file: (picked as unknown as { file?: Blob }).file,
    });
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const pickerResult = await ImagePicker.launchCameraAsync({ quality: 0.5, mediaTypes: ['images'] });
    await pickFromPicker(pickerResult);
  };

  const openLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const pickerResult = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, mediaTypes: ['images'] });
    await pickFromPicker(pickerResult);
  };

  const analyzeMutation = useMutation({
    mutationFn: () => aiApi.analyzePlate(asset!),
    onSuccess: (data) => {
      setResult(data);
      setDescription(data.description);
      setCalories(String(data.estimatedCalories));
      setProtein(String(data.proteinG));
      setCarb(String(data.carbG));
      setFat(String(data.fatG));
    },
  });

  const addToMealMutation = useMutation({
    mutationFn: () =>
      mealApi.addAiEstimate({
        logDate: todayDateString(),
        mealType,
        aiPlateAnalysisId: result!.analysisId,
        description,
        calories: Number(calories) || 0,
        proteinG: Number(protein) || 0,
        carbG: Number(carb) || 0,
        fatG: Number(fat) || 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailySummaryQueryKey(todayDateString()) });
      router.replace('/home');
    },
  });

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
          Tabak fotoğrafı çek
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
          Yapay zeka tabağındaki yemeği tanıyıp kalori/makro tahmini yapsın.
        </Text>

        {!asset ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button title="Kamera" onPress={openCamera} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Galeriden seç" variant="secondary" onPress={openLibrary} />
            </View>
          </View>
        ) : (
          <>
            <Image
              source={{ uri: asset.uri }}
              style={{ width: '100%', height: 220, borderRadius: 16, backgroundColor: colors.surface }}
              resizeMode="cover"
            />

            {!result ? (
              <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                {analyzeMutation.isError ? (
                  <Text style={{ color: colors.danger }}>{getApiErrorMessage(analyzeMutation.error)}</Text>
                ) : null}
                <Button
                  title="Analiz et"
                  loading={analyzeMutation.isPending}
                  onPress={() => analyzeMutation.mutate()}
                />
                <Button title="Farklı fotoğraf seç" variant="secondary" onPress={resetForNewPhoto} />
              </View>
            ) : (
              <View style={{ marginTop: spacing.md }}>
                <TextField label="Ne yedin?" value={description} onChangeText={setDescription} />

                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <TextField label="Kalori (kcal)" keyboardType="number-pad" value={calories} onChangeText={setCalories} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField label="Protein (g)" keyboardType="number-pad" value={protein} onChangeText={setProtein} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <TextField label="Karbonhidrat (g)" keyboardType="number-pad" value={carb} onChangeText={setCarb} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField label="Yağ (g)" keyboardType="number-pad" value={fat} onChangeText={setFat} />
                  </View>
                </View>

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

                {addToMealMutation.isError ? (
                  <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
                    {getApiErrorMessage(addToMealMutation.error)}
                  </Text>
                ) : null}

                <Button
                  title="Günlüğe ekle"
                  loading={addToMealMutation.isPending}
                  onPress={() => addToMealMutation.mutate()}
                />
                <View style={{ marginTop: spacing.sm }}>
                  <Button title="Farklı fotoğraf seç" variant="secondary" onPress={resetForNewPhoto} />
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
