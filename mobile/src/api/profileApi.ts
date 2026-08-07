import { isAxiosError } from 'axios';

import { apiClient } from './client';
import { OnboardingRequest, ProfileDto } from './types';

export const profileApi = {
  // Onboarding hiç tamamlanmamışsa backend 404 döner; bunu hata değil "profil yok" olarak ele alıyoruz.
  me: async (): Promise<ProfileDto | null> => {
    try {
      const { data } = await apiClient.get<ProfileDto>('/api/profile/me');
      return data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
  completeOnboarding: (payload: OnboardingRequest) =>
    apiClient.post<ProfileDto>('/api/profile/onboarding', payload).then((res) => res.data),
};
