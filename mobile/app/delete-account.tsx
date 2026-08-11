import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/theme/ThemeProvider';
import { authApi } from '@/api/authApi';
import { clearSession } from '@/api/session';
import { getApiErrorMessage } from '@/utils/apiError';

export default function DeleteAccountScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState('');

  const expectedConfirmText = t('deleteAccount.confirmPlaceholder');
  const isConfirmed = confirmText.trim().toLowerCase() === expectedConfirmText.toLowerCase();

  const deleteMutation = useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: async () => {
      await clearSession();
      router.replace('/login');
    },
  });

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        hitSlop={8}
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, marginBottom: spacing.sm }}
      >
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        <Text style={{ color: colors.textPrimary, fontSize: 16 }}>{t('common.back')}</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md }}>
          {t('deleteAccount.title')}
        </Text>

        <View
          style={{
            padding: spacing.md,
            borderRadius: 16,
            backgroundColor: colors.danger + '15',
            borderWidth: 1,
            borderColor: colors.danger,
            marginBottom: spacing.lg,
          }}
        >
          <Text style={{ color: colors.textPrimary, lineHeight: 20 }}>{t('deleteAccount.warning')}</Text>
        </View>

        <TextField
          label={t('deleteAccount.confirmLabel')}
          value={confirmText}
          onChangeText={setConfirmText}
          placeholder={expectedConfirmText}
          autoCapitalize="characters"
        />

        {deleteMutation.isError ? (
          <Text style={{ color: colors.danger, marginBottom: spacing.sm }}>
            {getApiErrorMessage(deleteMutation.error, t, t('deleteAccount.genericError'))}
          </Text>
        ) : null}

        <Button
          title={t('deleteAccount.confirmButton')}
          disabled={!isConfirmed}
          loading={deleteMutation.isPending}
          onPress={() => deleteMutation.mutate()}
        />

        <View style={{ marginTop: spacing.sm }}>
          <Button
            title={t('deleteAccount.cancelButton')}
            variant="secondary"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
