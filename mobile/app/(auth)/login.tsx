import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
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

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre gerekli'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();

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
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>Tekrar hoş geldin</Text>
        <Text style={{ marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary }}>
          Devam etmek için giriş yap
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              label="Email"
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
              label="Şifre"
              secureTextEntry
              value={field.value}
              onChangeText={field.onChange}
              error={errors.password?.message}
            />
          )}
        />

        {loginMutation.isError ? (
          <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
            {getApiErrorMessage(loginMutation.error, 'Email veya şifre hatalı.')}
          </Text>
        ) : null}

        <Button
          title="Giriş yap"
          loading={loginMutation.isPending}
          onPress={handleSubmit((values) => loginMutation.mutate(values))}
        />

        <SocialLoginButtons />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
          <Text style={{ color: colors.textSecondary }}>Hesabın yok mu? </Text>
          <Link href="/register" replace>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Kayıt ol</Text>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
