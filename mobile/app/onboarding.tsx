import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { OptionCard } from '@/components/OptionCard';
import { DateField } from '@/components/DateField';
import { useTheme } from '@/theme/ThemeProvider';
import { profileApi } from '@/api/profileApi';
import { profileQueryKey } from '@/hooks/useProfile';
import { ActivityLevel, Gender, Goal } from '@/api/types';
import { toDateOnlyString } from '@/utils/date';
import { getApiErrorMessage } from '@/utils/apiError';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'Female', label: 'Kadın' },
  { value: 'Male', label: 'Erkek' },
];

const GOAL_OPTIONS: { value: Goal; label: string; description: string }[] = [
  { value: 'Lose', label: 'Kilo vermek', description: 'Kalori açığıyla sağlıklı kilo kaybı' },
  { value: 'Maintain', label: 'Kilomu korumak', description: 'Mevcut kiloyu sürdür' },
  { value: 'Gain', label: 'Kilo almak', description: 'Kalori fazlasıyla kontrollü kilo alımı' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'Sedentary', label: 'Hareketsiz', description: 'Masa başı iş, egzersiz yok' },
  { value: 'Light', label: 'Az aktif', description: 'Haftada 1-3 gün hafif egzersiz' },
  { value: 'Moderate', label: 'Orta aktif', description: 'Haftada 3-5 gün egzersiz' },
  { value: 'Active', label: 'Aktif', description: 'Haftada 6-7 gün egzersiz' },
  { value: 'VeryActive', label: 'Çok aktif', description: 'Günde 2 kez / fiziksel iş' },
];

const MIN_DATE = new Date(new Date().getFullYear() - 100, 0, 1);
const MAX_DATE = new Date(new Date().getFullYear() - 13, 11, 31);

export default function OnboardingScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [gender, setGender] = useState<Gender | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [goalWeightKg, setGoalWeightKg] = useState('');

  const stepKeys = useMemo(() => {
    const base = ['gender', 'birthDate', 'body', 'goal', 'activity'];
    if (goal && goal !== 'Maintain') {
      base.push('goalWeight');
    }
    return base;
  }, [goal]);

  const currentKey = stepKeys[step];
  const isLastStep = step === stepKeys.length - 1;

  const onboardingMutation = useMutation({
    mutationFn: profileApi.completeOnboarding,
    onSuccess: (profile) => {
      queryClient.setQueryData(profileQueryKey, profile);
      router.replace('/home');
    },
  });

  const goNext = () => {
    setError(null);

    if (currentKey === 'gender' && !gender) {
      setError('Devam etmek için bir seçim yap.');
      return;
    }
    if (currentKey === 'birthDate' && !birthDate) {
      setError('Doğum tarihini seç.');
      return;
    }
    if (currentKey === 'body') {
      const height = Number(heightCm);
      const weight = Number(weightKg);
      if (!height || height < 100 || height > 250) {
        setError('Boy 100-250 cm aralığında olmalı.');
        return;
      }
      if (!weight || weight < 30 || weight > 300) {
        setError('Kilo 30-300 kg aralığında olmalı.');
        return;
      }
    }
    if (currentKey === 'goal' && !goal) {
      setError('Devam etmek için bir hedef seç.');
      return;
    }
    if (currentKey === 'activity' && !activityLevel) {
      setError('Devam etmek için aktivite seviyeni seç.');
      return;
    }

    if (isLastStep) {
      if (!gender || !birthDate || !goal || !activityLevel) {
        return;
      }

      onboardingMutation.mutate({
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        birthDate: toDateOnlyString(birthDate),
        gender,
        activityLevel,
        goal,
        goalWeightKg: goal !== 'Maintain' && goalWeightKg ? Number(goalWeightKg) : null,
      });
      return;
    }

    setStep((s) => s + 1);
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.lg }}>
        {stepKeys.map((key, index) => (
          <View
            key={key}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: index <= step ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {currentKey === 'gender' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              Cinsiyetin nedir?
            </Text>
            {GENDER_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={gender === option.value}
                onPress={() => setGender(option.value)}
              />
            ))}
          </View>
        )}

        {currentKey === 'birthDate' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              Doğum tarihin?
            </Text>
            <DateField value={birthDate} onChange={setBirthDate} minimumDate={MIN_DATE} maximumDate={MAX_DATE} />
          </View>
        )}

        {currentKey === 'body' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              Boy ve kilon
            </Text>
            <TextField
              label="Boy (cm)"
              keyboardType="number-pad"
              value={heightCm}
              onChangeText={setHeightCm}
              placeholder="175"
            />
            <TextField
              label="Kilo (kg)"
              keyboardType="decimal-pad"
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="70"
            />
          </View>
        )}

        {currentKey === 'goal' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              Hedefin nedir?
            </Text>
            {GOAL_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                description={option.description}
                selected={goal === option.value}
                onPress={() => setGoal(option.value)}
              />
            ))}
          </View>
        )}

        {currentKey === 'activity' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              Aktivite seviyen?
            </Text>
            {ACTIVITY_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                description={option.description}
                selected={activityLevel === option.value}
                onPress={() => setActivityLevel(option.value)}
              />
            ))}
          </View>
        )}

        {currentKey === 'goalWeight' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              Hedef kilon (opsiyonel)
            </Text>
            <TextField
              label="Hedef kilo (kg)"
              keyboardType="decimal-pad"
              value={goalWeightKg}
              onChangeText={setGoalWeightKg}
              placeholder="Boş bırakabilirsin"
            />
          </View>
        )}
      </View>

      {error ? <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>{error}</Text> : null}
      {onboardingMutation.isError ? (
        <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
          {getApiErrorMessage(onboardingMutation.error)}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {step > 0 && (
          <View style={{ flex: 1 }}>
            <Button title="Geri" variant="secondary" onPress={goBack} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Button
            title={isLastStep ? 'Tamamla' : 'İleri'}
            loading={onboardingMutation.isPending}
            onPress={goNext}
          />
        </View>
      </View>
    </Screen>
  );
}
