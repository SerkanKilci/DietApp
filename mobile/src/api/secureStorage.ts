import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'dietapp_refresh_token';

// expo-secure-store'un web taşıması yok (native modülü web'de boş obje) — donanım destekli
// güvenli depolamanın tarayıcıda karşılığı da yok zaten, bu yüzden web'de localStorage'a düşüyoruz.
const nativeStorage = {
  get: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
};

const webStorage = {
  get: async () => (typeof localStorage === 'undefined' ? null : localStorage.getItem(REFRESH_TOKEN_KEY)),
  set: async (token: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },
  clear: async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
};

export const refreshTokenStorage = Platform.OS === 'web' ? webStorage : nativeStorage;
