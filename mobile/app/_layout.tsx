import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { hydrateSession } from '@/api/client';
import { useProfile } from '@/hooks/useProfile';
import { initI18n } from '@/i18n';

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  const profileQuery = useProfile(isHydrated && Boolean(accessToken));

  useEffect(() => {
    hydrateSession();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onOnboardingScreen = segments[0] === 'onboarding';

    if (!accessToken) {
      if (!inAuthGroup) {
        router.replace('/login');
      }
      return;
    }

    // Profil sorgusu bitene kadar bekle — aksi halde her açılışta kısaca
    // yanlış ekrana (home ya da onboarding) sıçrama olur. Sorgu hata verdiyse
    // (ör. ağ kopması) "profil yok" varsayıp onboarding'e atmıyoruz — kullanıcının
    // gerçek profili olabilir, aşağıda ayrı bir tekrar-dene ekranı gösteriliyor.
    if (!profileQuery.isFetched || profileQuery.isError) return;

    const hasProfile = Boolean(profileQuery.data);

    if (!hasProfile && !onOnboardingScreen) {
      router.replace('/onboarding');
    } else if (hasProfile && inAuthGroup) {
      // Not: onOnboardingScreen burada bilerek yok — profili varken kullanıcı Profil
      // sekmesinden "Profilimi güncelle" ile /onboarding'e bilerek gidebilmeli, geri atılmamalı.
      router.replace('/home');
    }
  }, [isHydrated, accessToken, segments, router, profileQuery.isFetched, profileQuery.isError, profileQuery.data]);

  const isWaitingOnProfile = isHydrated && Boolean(accessToken) && !profileQuery.isFetched;

  if (isHydrated && Boolean(accessToken) && profileQuery.isError) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
          padding: spacing.lg,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: 16, textAlign: 'center', marginBottom: spacing.md }}>
          {t('common.genericError')}
        </Text>
        <Button title={t('common.retry')} onPress={() => profileQuery.refetch()} />
      </View>
    );
  }

  if (!isHydrated || isWaitingOnProfile) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

function RootStack() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </AuthGate>
    </>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setIsI18nReady(true));
  }, []);

  if (!isI18nReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
