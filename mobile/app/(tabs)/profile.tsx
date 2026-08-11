import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { authApi } from '@/api/authApi';
import { clearSession } from '@/api/session';
import { refreshTokenStorage } from '@/api/secureStorage';
import { SUPPORTED_LANGUAGES, setAppLanguage } from '@/i18n';
import { useUnitStore } from '@/store/unitStore';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@/constants/legal';

function MenuRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { colors, spacing } = useTheme();
  const tintColor = danger ? colors.danger : colors.primary;

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
      <Ionicons name={icon} size={20} color={tintColor} style={{ marginRight: spacing.sm }} />
      <Text style={{ flex: 1, color: danger ? colors.danger : colors.textPrimary, fontSize: 15, fontWeight: '500' }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { preference, setPreference } = useThemeStore();
  const { system: unitSystem, setSystem: setUnitSystem } = useUnitStore();

  const themePreferenceLabels: Record<typeof preference, string> = {
    system: t('profile.themeSystem'),
    light: t('profile.themeLight'),
    dark: t('profile.themeDark'),
  };

  const languageLabels: Record<string, string> = {
    tr: t('profile.languageTr'),
    en: t('profile.languageEn'),
    fr: t('profile.languageFr'),
    de: t('profile.languageDe'),
  };

  const unitSystemLabels: Record<typeof unitSystem, string> = {
    metric: t('profile.unitsMetric'),
    imperial: t('profile.unitsImperial'),
  };

  const cyclePreference = () => {
    const next = preference === 'system' ? 'light' : preference === 'light' ? 'dark' : 'system';
    setPreference(next);
  };

  const cycleLanguage = () => {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(i18n.language as (typeof SUPPORTED_LANGUAGES)[number]);
    const next = SUPPORTED_LANGUAGES[(currentIndex + 1) % SUPPORTED_LANGUAGES.length];
    setAppLanguage(next);
  };

  const cycleUnitSystem = () => {
    setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric');
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>{t('profile.title')}</Text>

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
        <MenuRow icon="body-outline" label={t('profile.updateProfile')} onPress={() => router.push('/onboarding')} />
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <MenuRow icon="options-outline" label={t('profile.editGoals')} onPress={() => router.push('/edit-goals')} />
      </View>

      <View
        style={{
          marginTop: spacing.md,
          padding: spacing.md,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: 'row',
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textSecondary }}>{t('profile.themePreference')}</Text>
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
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{themePreferenceLabels[preference]}</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textSecondary }}>{t('profile.language')}</Text>
          <Pressable
            onPress={cycleLanguage}
            style={{
              marginTop: spacing.sm,
              alignSelf: 'flex-start',
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: 999,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{languageLabels[i18n.language] ?? i18n.language}</Text>
          </Pressable>
        </View>
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
        <Text style={{ color: colors.textSecondary }}>{t('profile.units')}</Text>
        <Pressable
          onPress={cycleUnitSystem}
          style={{
            marginTop: spacing.sm,
            alignSelf: 'flex-start',
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: 999,
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{unitSystemLabels[unitSystem]}</Text>
        </Pressable>
      </View>

      <View
        style={{
          marginBottom: spacing.lg,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}
      >
        <MenuRow
          icon="document-text-outline"
          label={t('profile.privacyPolicy')}
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        />
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <MenuRow
          icon="document-text-outline"
          label={t('profile.termsOfService')}
          onPress={() => Linking.openURL(TERMS_OF_SERVICE_URL)}
        />
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <MenuRow
          icon="trash-outline"
          label={t('profile.deleteAccount')}
          danger
          onPress={() => router.push('/delete-account')}
        />
      </View>

      <Button
        title={t('profile.logout')}
        variant="secondary"
        loading={logoutMutation.isPending}
        onPress={() => logoutMutation.mutate()}
      />
      </ScrollView>
    </Screen>
  );
}
