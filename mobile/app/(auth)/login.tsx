import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
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
import { emailSchema } from '@/utils/validation';
import { getApiErrorMessage } from '@/utils/apiError';

type LoginFormValues = { email: string; password: string };

export default function LoginScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const loginSchema = useMemo(
    () =>
      z.object({
        email: emailSchema(t),
        password: z.string().min(1, t('validation.passwordRequiredLogin')),
      }),
    [t]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      await applySession(data);
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
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>{t('auth.loginTitle')}</Text>
        <Text style={{ marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary }}>
          {t('auth.loginSubtitle')}
        </Text>

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

        {loginMutation.isError ? (
          <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
            {getApiErrorMessage(loginMutation.error, t, t('auth.wrongCredentials'))}
          </Text>
        ) : null}

        <Button
          title={t('auth.signIn')}
          loading={loginMutation.isPending}
          onPress={handleSubmit((values) => loginMutation.mutate(values))}
        />

        <SocialLoginButtons />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
          <Text style={{ color: colors.textSecondary }}>{t('auth.noAccount')}</Text>
          <Link href="/register" replace>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('auth.signUp')}</Text>
          </Link>
        </View>
      </ScrollView>
    </Screen>
  );
}
