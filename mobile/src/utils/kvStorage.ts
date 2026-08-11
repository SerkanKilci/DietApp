import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store'un web taşıması yok, bu yüzden web'de localStorage'a düşüyoruz
// (aynı desen api/secureStorage.ts içinde refresh token için de kullanılıyor).
const nativeStorage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
};

const webStorage = {
  get: async (key: string) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key)),
  set: async (key: string, value: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
};

const storage = Platform.OS === 'web' ? webStorage : nativeStorage;

const LANGUAGE_KEY = 'dietapp_language';

export const languageStorage = {
  get: () => storage.get(LANGUAGE_KEY),
  set: (value: string) => storage.set(LANGUAGE_KEY, value),
};
