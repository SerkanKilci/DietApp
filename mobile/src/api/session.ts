import { refreshTokenStorage } from '@/api/secureStorage';
import { useAuthStore } from '@/store/authStore';
import { initPurchases, logOutPurchases } from '@/api/purchases';
import { AuthResponse } from './types';

export async function applySession(auth: AuthResponse): Promise<void> {
  await refreshTokenStorage.set(auth.refreshToken);
  useAuthStore.getState().setSession(auth.accessToken, auth.user);
  // RevenueCat'in app_user_id'si kendi UserId'imizle birebir aynı olmalı — webhook bunu varsayıyor.
  initPurchases(auth.user.id);
}

export async function clearSession(): Promise<void> {
  await logOutPurchases();
  await refreshTokenStorage.clear();
  useAuthStore.getState().clearSession();
}
