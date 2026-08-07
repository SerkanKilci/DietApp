import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authApi } from '@/api/authApi';
import { clearSession } from '@/api/session';
import { refreshTokenStorage } from '@/api/secureStorage';

export default function ProfileScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { preference, setPreference } = useThemeStore();

  const cyclePreference = () => {
    const next = preference === 'system' ? 'light' : preference === 'light' ? 'dark' : 'system';
    setPreference(next);
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = await refreshTokenStorage.get();
      if (refreshToken) {
        await authApi.logout({ refreshToken }).catch(() => undefined);
      }
    },
    onSettled: async () => {
      await clearSession();
      router.replace('/login');
    },
  });

  return (
    <Screen>
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>Profil</Text>

      {user ? (
        <Text style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
          {user.displayName} · {user.email}
        </Text>
      ) : null}

      <View
        style={{
          marginTop: spacing.lg,
          marginBottom: spacing.lg,
          padding: spacing.md,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.textSecondary }}>Tema tercihi</Text>
        <Pressable
          onPress={cyclePreference}
          style={{
            marginTop: spacing.sm,
            alignSelf: 'flex-start',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: 999,
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{preference}</Text>
        </Pressable>
      </View>

      <Button
        title="Çıkış yap"
        variant="secondary"
        loading={logoutMutation.isPending}
        onPress={() => logoutMutation.mutate()}
      />
    </Screen>
  );
}
