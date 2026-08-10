import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authApi } from '@/api/authApi';
import { clearSession } from '@/api/session';
import { refreshTokenStorage } from '@/api/secureStorage';

function MenuRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { colors, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
      }}
    >
      <Ionicons name={icon} size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
      <Text style={{ flex: 1, color: colors.textPrimary, fontSize: 15, fontWeight: '500' }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

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
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}
      >
        <MenuRow icon="body-outline" label="Profilimi güncelle" onPress={() => router.push('/onboarding')} />
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <MenuRow icon="options-outline" label="Hedeflerimi elle ayarla" onPress={() => router.push('/edit-goals')} />
      </View>

      <View
        style={{
          marginTop: spacing.md,
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
