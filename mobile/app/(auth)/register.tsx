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
import { emailSchema, passwordSchema } from '@/utils/validation';
import { getApiErrorMessage } from '@/utils/apiError';

const registerSchema = z.object({
  displayName: z.string().trim().min(2, 'İsim en az 2 karakter olmalı'),
  email: emailSchema,
  password: passwordSchema,
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();

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
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>Hesap oluştur</Text>
        <Text style={{ marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary }}>
          Diyet takibine başlamak için kayıt ol
        </Text>

        <Controller
          control={control}
          name="displayName"
          render={({ field }) => (
            <TextField
              label="Ad Soyad"
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

        {registerMutation.isError ? (
          <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
            {getApiErrorMessage(registerMutation.error)}
          </Text>
        ) : null}

        <Button
          title="Kayıt ol"
          loading={registerMutation.isPending}
          onPress={handleSubmit((values) => registerMutation.mutate(values))}
        />

        <SocialLoginButtons />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
          <Text style={{ color: colors.textSecondary }}>Zaten hesabın var mı? </Text>
          <Link href="/login" replace>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Giriş yap</Text>
          </Link>
        </View>
      </View>
    </Screen>
  );
}
