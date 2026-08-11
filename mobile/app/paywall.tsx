import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { getCurrentOffering, purchasePackage, restorePurchases, type PurchasesPackage } from '@/api/purchases';
import { premiumStatusQueryKey, usePremiumStatus } from '@/hooks/usePremiumStatus';

function FeatureRow({ text }: { text: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
      <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
      <Text style={{ color: colors.textPrimary, fontSize: 15 }}>{text}</Text>
    </View>
  );
}

export default function PaywallScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [purchaseError, setPurchaseError] = useState(false);

  const premiumStatus = usePremiumStatus(true);

  const offeringQuery = useQuery({
    queryKey: ['purchases', 'offering'],
    queryFn: getCurrentOffering,
    enabled: Platform.OS !== 'web' && !premiumStatus.data?.isPremium,
  });

  const purchaseMutation = useMutation({
    mutationFn: (pkg: PurchasesPackage) => purchasePackage(pkg),
    onSuccess: async (result) => {
      setPurchaseError(false);
      if (result.userCancelled) return;
      await queryClient.invalidateQueries({ queryKey: premiumStatusQueryKey });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/home');
      }
    },
    onError: () => setPurchaseError(true),
  });

  const restoreMutation = useMutation({
    mutationFn: restorePurchases,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: premiumStatusQueryKey }),
  });

  const packages = offeringQuery.data?.availablePackages ?? [];

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        hitSlop={8}
        style={{ alignSelf: 'flex-end', paddingVertical: spacing.xs, marginBottom: spacing.sm }}
      >
        <Ionicons name="close" size={26} color={colors.textPrimary} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs }}>
          {t('paywall.title')}
        </Text>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.lg }}>{t('paywall.subtitle')}</Text>

        <FeatureRow text={t('paywall.featureAiScan')} />
        <FeatureRow text={t('paywall.featureOneTap')} />

        <View style={{ marginTop: spacing.lg }}>
          {premiumStatus.data?.isPremium ? (
            <Text style={{ color: colors.primary, fontWeight: '600', textAlign: 'center' }}>
              {t('paywall.alreadyPremium')}
            </Text>
          ) : Platform.OS === 'web' ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{t('paywall.webUnavailable')}</Text>
          ) : offeringQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : offeringQuery.isError ? (
            <Text style={{ color: colors.danger, textAlign: 'center' }}>{t('paywall.loadFailed')}</Text>
          ) : packages.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{t('paywall.noOfferings')}</Text>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {packages.map((pkg) => (
                <Button
                  key={pkg.identifier}
                  title={`${pkg.product.title} — ${pkg.product.priceString}`}
                  loading={purchaseMutation.isPending}
                  onPress={() => purchaseMutation.mutate(pkg)}
                />
              ))}
            </View>
          )}

          {purchaseError ? (
            <Text style={{ color: colors.danger, marginTop: spacing.sm, textAlign: 'center' }}>
              {t('paywall.purchaseError')}
            </Text>
          ) : null}
        </View>

        {Platform.OS !== 'web' && !premiumStatus.data?.isPremium ? (
          <View style={{ marginTop: spacing.md }}>
            <Button
              title={t('paywall.restorePurchases')}
              variant="secondary"
              loading={restoreMutation.isPending}
              onPress={() => restoreMutation.mutate()}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
