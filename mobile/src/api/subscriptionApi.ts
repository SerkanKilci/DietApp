import { apiClient } from './client';
import { SubscriptionStatusDto } from './types';

export const subscriptionApi = {
  // Kaynak-doğruluk her zaman backend'dir (RevenueCat webhook'u burayı güncel tutar) — mobil,
  // native SDK'nın yerel CustomerInfo'suna değil bu endpoint'e güveniyor.
  getStatus: () => apiClient.get<SubscriptionStatusDto>('/api/subscriptions/me').then((res) => res.data),
};
