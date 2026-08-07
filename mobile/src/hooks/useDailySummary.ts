import { useQuery } from '@tanstack/react-query';

import { mealApi } from '@/api/mealApi';

export function dailySummaryQueryKey(date: string) {
  return ['meals', 'daily-summary', date] as const;
}

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: dailySummaryQueryKey(date),
    queryFn: () => mealApi.getDailySummary(date),
  });
}
