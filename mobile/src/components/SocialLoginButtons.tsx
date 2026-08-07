import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { authApi } from '@/api/authApi';
import { applySession } from '@/api/session';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';

// Google OAuth redirect'i tarayıcı sekmesinde açılır; kullanıcı geri dönünce sekmenin
// kapanması için expo-auth-session'ın önerdiği tek satırlık kurulum.
WebBrowser.maybeCompleteAuthSession();

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export function SocialLoginButtons() {
  const { spacing } = useTheme();
  const router = useRouter();

  const externalLoginMutation = useMutation({
    mutationFn: authApi.externalLogin,
    onSuccess: async (data) => {
      await applySession(data);
      router.replace('/home');
    },
  });

  const isGoogleConfigured = Boolean(
    extra.googleIosClientId || extra.googleAndroidClientId || extra.googleWebClientId
  );

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: extra.googleIosClientId || 'not-configured',
    androidClientId: extra.googleAndroidClientId || 'not-configured',
    webClientId: extra.googleWebClientId || 'not-configured',
  });

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      externalLoginMutation.mutate({ provider: 'Google', idToken: response.params.id_token });
    }
  }, [response]);

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        externalLoginMutation.mutate({ provider: 'Apple', idToken: credential.identityToken });
      }
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (code !== 'ERR_REQUEST_CANCELED') {
        throw err;
      }
    }
  };

  return (
    <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
      <Button
        title="Google ile devam et"
        variant="secondary"
        disabled={!isGoogleConfigured || !request || externalLoginMutation.isPending}
        onPress={() => promptAsync()}
      />

      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={12}
          style={{ height: 48 }}
          onPress={handleAppleSignIn}
        />
      )}
    </View>
  );
}
