import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { hydrateSession } from '@/api/client';
import { useProfile } from '@/hooks/useProfile';

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { colors } = useTheme();
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
    // yanlış ekrana (home ya da onboarding) sıçrama olur.
    if (!profileQuery.isFetched) return;

    const hasProfile = Boolean(profileQuery.data);

    if (!hasProfile && !onOnboardingScreen) {
      router.replace('/onboarding');
    } else if (hasProfile && inAuthGroup) {
      // Not: onOnboardingScreen burada bilerek yok — profili varken kullanıcı Profil
      // sekmesinden "Profilimi güncelle" ile /onboarding'e bilerek gidebilmeli, geri atılmamalı.
      router.replace('/home');
    }
  }, [isHydrated, accessToken, segments, router, profileQuery.isFetched, profileQuery.data]);

  const isWaitingOnProfile = isHydrated && Boolean(accessToken) && !profileQuery.isFetched;

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
