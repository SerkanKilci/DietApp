import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { OptionCard } from '@/components/OptionCard';
import { DateField } from '@/components/DateField';
import { useTheme } from '@/theme/ThemeProvider';
import { profileApi } from '@/api/profileApi';
import { profileQueryKey, useProfile } from '@/hooks/useProfile';
import { ActivityLevel, Gender, Goal } from '@/api/types';
import { fromDateOnlyString, toDateOnlyString } from '@/utils/date';
import { getApiErrorMessage } from '@/utils/apiError';
import { useUnitStore } from '@/store/unitStore';
import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg } from '@/utils/units';

const MIN_DATE = new Date(new Date().getFullYear() - 100, 0, 1);
const MAX_DATE = new Date(new Date().getFullYear() - 13, 11, 31);

export default function OnboardingScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const profileQuery = useProfile(true);
  const isEditMode = useRef(false);
  const prefilled = useRef(false);
  const { t } = useTranslation();
  const { system: unitSystem } = useUnitStore();

  const GENDER_OPTIONS: { value: Gender; label: string }[] = [
    { value: 'Female', label: t('onboarding.genderFemale') },
    { value: 'Male', label: t('onboarding.genderMale') },
  ];

  const GOAL_OPTIONS: { value: Goal; label: string; description: string }[] = [
    { value: 'Lose', label: t('onboarding.goalLose'), description: t('onboarding.goalLoseDesc') },
    { value: 'Maintain', label: t('onboarding.goalMaintain'), description: t('onboarding.goalMaintainDesc') },
    { value: 'Gain', label: t('onboarding.goalGain'), description: t('onboarding.goalGainDesc') },
  ];

  const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
    { value: 'Sedentary', label: t('onboarding.activitySedentary'), description: t('onboarding.activitySedentaryDesc') },
    { value: 'Light', label: t('onboarding.activityLight'), description: t('onboarding.activityLightDesc') },
    { value: 'Moderate', label: t('onboarding.activityModerate'), description: t('onboarding.activityModerateDesc') },
    { value: 'Active', label: t('onboarding.activityActive'), description: t('onboarding.activityActiveDesc') },
    { value: 'VeryActive', label: t('onboarding.activityVeryActive'), description: t('onboarding.activityVeryActiveDesc') },
  ];

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [gender, setGender] = useState<Gender | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [goalWeightKg, setGoalWeightKg] = useState('');

  // Sunucuya her zaman metrik (cm/kg) gönderilir — bunlar sadece imperial birim
  // sistemindeyken gösterilen giriş alanları, değişince canonical heightCm/weightKg'ı günceller.
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightLb, setWeightLb] = useState('');
  const [goalWeightLb, setGoalWeightLb] = useState('');

  const handleHeightFeetChange = (value: string) => {
    setHeightFeet(value);
    setHeightCm(String(feetInchesToCm(Number(value) || 0, Number(heightInches) || 0)));
  };

  const handleHeightInchesChange = (value: string) => {
    setHeightInches(value);
    setHeightCm(String(feetInchesToCm(Number(heightFeet) || 0, Number(value) || 0)));
  };

  const handleWeightLbChange = (value: string) => {
    setWeightLb(value);
    setWeightKg(String(lbToKg(Number(value) || 0)));
  };

  const handleGoalWeightLbChange = (value: string) => {
    setGoalWeightLb(value);
    setGoalWeightKg(String(lbToKg(Number(value) || 0)));
  };

  useEffect(() => {
    if (prefilled.current || !profileQuery.data) {
      return;
    }

    const p = profileQuery.data;
    setGender(p.gender);
    setBirthDate(fromDateOnlyString(p.birthDate));
    setHeightCm(String(p.heightCm));
    setWeightKg(String(p.weightKg));
    setGoal(p.goal);
    setActivityLevel(p.activityLevel);
    setGoalWeightKg(p.goalWeightKg != null ? String(p.goalWeightKg) : '');

    const { feet, inches } = cmToFeetInches(p.heightCm);
    setHeightFeet(String(feet));
    setHeightInches(String(inches));
    setWeightLb(String(kgToLb(p.weightKg)));
    if (p.goalWeightKg != null) {
      setGoalWeightLb(String(kgToLb(p.goalWeightKg)));
    }

    isEditMode.current = true;
    prefilled.current = true;
  }, [profileQuery.data]);

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
      if (isEditMode.current && router.canGoBack()) {
        router.back();
      } else {
        router.replace('/home');
      }
    },
  });

  const goNext = () => {
    setError(null);

    if (currentKey === 'gender' && !gender) {
      setError(t('onboarding.selectRequired'));
      return;
    }
    if (currentKey === 'birthDate' && !birthDate) {
      setError(t('onboarding.birthDateRequired'));
      return;
    }
    if (currentKey === 'body') {
      const height = Number(heightCm);
      const weight = Number(weightKg);
      if (!height || height < 100 || height > 250) {
        setError(t('onboarding.heightRangeError'));
        return;
      }
      if (!weight || weight < 30 || weight > 300) {
        setError(t('onboarding.weightRangeError'));
        return;
      }
    }
    if (currentKey === 'goal' && !goal) {
      setError(t('onboarding.goalRequired'));
      return;
    }
    if (currentKey === 'activity' && !activityLevel) {
      setError(t('onboarding.activityRequired'));
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

  if (profileQuery.isLoading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      {isEditMode.current && (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, marginBottom: spacing.sm }}
        >
          <Ionicons name="close" size={22} color={colors.textPrimary} />
          <Text style={{ color: colors.textPrimary, fontSize: 16, marginLeft: 4 }}>{t('common.cancel')}</Text>
        </Pressable>
      )}

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

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {currentKey === 'gender' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              {t('onboarding.genderTitle')}
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
              {t('onboarding.birthDateTitle')}
            </Text>
            <DateField value={birthDate} onChange={setBirthDate} minimumDate={MIN_DATE} maximumDate={MAX_DATE} />
          </View>
        )}

        {currentKey === 'body' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              {t('onboarding.bodyTitle')}
            </Text>
            {unitSystem === 'imperial' ? (
              <>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={t('onboarding.heightFeet')}
                      keyboardType="number-pad"
                      value={heightFeet}
                      onChangeText={handleHeightFeetChange}
                      placeholder="5"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label={t('onboarding.heightInches')}
                      keyboardType="number-pad"
                      value={heightInches}
                      onChangeText={handleHeightInchesChange}
                      placeholder="9"
                    />
                  </View>
                </View>
                <TextField
                  label={t('onboarding.weightLb')}
                  keyboardType="decimal-pad"
                  value={weightLb}
                  onChangeText={handleWeightLbChange}
                  placeholder="154"
                />
              </>
            ) : (
              <>
                <TextField
                  label={t('onboarding.height')}
                  keyboardType="number-pad"
                  value={heightCm}
                  onChangeText={setHeightCm}
                  placeholder="175"
                />
                <TextField
                  label={t('onboarding.weight')}
                  keyboardType="decimal-pad"
                  value={weightKg}
                  onChangeText={setWeightKg}
                  placeholder="70"
                />
              </>
            )}
          </View>
        )}

        {currentKey === 'goal' && (
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
              {t('onboarding.goalTitle')}
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
              {t('onboarding.activityTitle')}
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
              {t('onboarding.goalWeightTitle')}
            </Text>
            {unitSystem === 'imperial' ? (
              <TextField
                label={t('onboarding.goalWeightLb')}
                keyboardType="decimal-pad"
                value={goalWeightLb}
                onChangeText={handleGoalWeightLbChange}
                placeholder={t('onboarding.goalWeightPlaceholder')}
              />
            ) : (
              <TextField
                label={t('onboarding.goalWeight')}
                keyboardType="decimal-pad"
                value={goalWeightKg}
                onChangeText={setGoalWeightKg}
                placeholder={t('onboarding.goalWeightPlaceholder')}
              />
            )}
          </View>
        )}
      </ScrollView>

      {error ? <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>{error}</Text> : null}
      {onboardingMutation.isError ? (
        <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
          {getApiErrorMessage(onboardingMutation.error, t)}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {step > 0 && (
          <View style={{ flex: 1 }}>
            <Button title={t('common.back')} variant="secondary" onPress={goBack} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Button
            title={isLastStep ? (isEditMode.current ? t('common.save') : t('onboarding.complete')) : t('onboarding.next')}
            loading={onboardingMutation.isPending}
            onPress={goNext}
          />
        </View>
      </View>
    </Screen>
  );
}
