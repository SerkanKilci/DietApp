import { refreshTokenStorage } from '@/api/secureStorage';
import { useAuthStore } from '@/store/authStore';
import { AuthResponse } from './types';

export async function applySession(auth: AuthResponse): Promise<void> {
  await refreshTokenStorage.set(auth.refreshToken);
  useAuthStore.getState().setSession(auth.accessToken, auth.user);
}

export async function clearSession(): Promise<void> {
  await refreshTokenStorage.clear();
  useAuthStore.getState().clearSession();
}
