import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

import { refreshTokenStorage } from './secureStorage';
import { applySession, clearSession } from './session';
import { getAccessToken } from './tokenStore';
import { AuthResponse } from './types';
import { useAuthStore } from '@/store/authStore';

// Android emulator can't reach the host machine via localhost — it uses 10.0.2.2 instead.
// iOS simulator and physical devices on the same network need their own values here.
// Override per environment via app.json -> expo.extra.apiUrl, or EXPO_PUBLIC_API_URL.
const apiUrl =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:5299';

export const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh sırasında bilerek çıplak axios kullanıyoruz: apiClient üzerinden gitseydi
// bu isteğin kendi 401'i de response interceptor'ını tetikleyip sonsuz döngü yaratabilirdi.
const PUBLIC_AUTH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/external-login', '/api/auth/refresh'];

let refreshPromise: Promise<string | null> | null = null;

// Hem 401 sonrası sessiz retry'da hem de uygulama açılışında (session.ts'teki hydrate akışında) kullanılır.
export async function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= (async () => {
    try {
      const storedRefreshToken = await refreshTokenStorage.get();
      if (!storedRefreshToken) {
        return null;
      }

      const { data } = await axios.post<AuthResponse>(`${apiUrl}/api/auth/refresh`, {
        refreshToken: storedRefreshToken,
      });
      await applySession(data);
      return data.accessToken;
    } catch {
      await clearSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Uygulama açılışında (app/_layout.tsx) bir kere çağrılır: SecureStore'da refresh token
// varsa sessizce yeni bir erişim token'ı alır, yoksa kullanıcı giriş ekranına yönlendirilir.
export async function hydrateSession(): Promise<void> {
  await refreshAccessToken();
  useAuthStore.getState().setHydrated();
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isPublicAuthCall = PUBLIC_AUTH_PATHS.some((path) => originalRequest?.url?.includes(path));

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isPublicAuthCall) {
      throw error;
    }

    originalRequest._retry = true;
    const newToken = await refreshAccessToken();

    if (!newToken) {
      throw error;
    }

    originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
    return apiClient.request(originalRequest);
  }
);
