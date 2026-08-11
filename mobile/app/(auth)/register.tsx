import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { SocialLoginButtons } from '@/components/SocialLoginButtons';
import { useTheme } from '@/theme/ThemeProvider';
import { authApi } from '@/api/authApi';
import { applySession } from '@/api/session';
import { emailSchema, passwordSchema } from '@/utils/validation';
import { getApiErrorMessage } from '@/utils/apiError';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/constants/legal';

type RegisterFormValues = { displayName: string; email: string; password: string };

export default function RegisterScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const registerSchema = useMemo(
    () =>
      z.object({
        displayName: z.string().trim().min(2, t('validation.nameMin')),
        email: emailSchema(t),
        password: passwordSchema(t),
      }),
    [t]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      await applySession(data);
      // Profil henüz yoksa AuthGate (app/_layout.tsx) burayı otomatik /onboarding'e çevirir.
      router.replace('/home');
    },
  });

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>{t('auth.registerTitle')}</Text>
        <Text style={{ marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary }}>
          {t('auth.registerSubtitle')}
        </Text>

        <Controller
          control={control}
          name="displayName"
          render={({ field }) => (
            <TextField
              label={t('auth.fullName')}
              value={field.value}
              onChangeText={field.onChange}
              error={errors.displayName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              label={t('auth.email')}
              autoCapitalize="none"
              keyboardType="email-address"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              label={t('auth.password')}
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              error={errors.password?.message}
            />
          )}
        />

        {registerMutation.isError ? (
          <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
            {getApiErrorMessage(registerMutation.error, t)}
          </Text>
        ) : null}

        <Button
          title={t('auth.signUp')}
          loading={registerMutation.isPending}
          onPress={handleSubmit((values) => registerMutation.mutate(values))}
        />

        <SocialLoginButtons />

        <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: spacing.md }}>
          {t('auth.agreementPrefix')}
          <Text style={{ color: colors.primary }} onPress={() => Linking.openURL(TERMS_OF_SERVICE_URL)}>
            {t('auth.termsLink')}
          </Text>
          {t('auth.agreementAnd')}
          <Text style={{ color: colors.primary }} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
            {t('auth.privacyLink')}
          </Text>
          {t('auth.agreementSuffix')}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
          <Text style={{ color: colors.textSecondary }}>{t('auth.haveAccount')}</Text>
          <Link href="/login" replace>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('auth.signIn')}</Text>
          </Link>
        </View>
      </ScrollView>
    </Screen>
  );
}
