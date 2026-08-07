import { useQuery } from '@tanstack/react-query';

import { profileApi } from '@/api/profileApi';

export const profileQueryKey = ['profile', 'me'] as const;

export function useProfile(enabled: boolean) {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: profileApi.me,
    enabled,
    staleTime: 60_000,
  });
}
