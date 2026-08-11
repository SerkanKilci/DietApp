import { useQuery } from '@tanstack/react-query';

import { subscriptionApi } from '@/api/subscriptionApi';

export const premiumStatusQueryKey = ['subscriptions', 'me'] as const;

export function usePremiumStatus(enabled: boolean) {
  return useQuery({
    queryKey: premiumStatusQueryKey,
    queryFn: subscriptionApi.getStatus,
    enabled,
    staleTime: 30_000,
  });
}
