import { create } from 'zustand';

import { setAccessToken } from '@/api/tokenStore';
import { UserDto } from '@/api/types';

interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  isHydrated: boolean;
  setSession: (accessToken: string, user: UserDto) => void;
  clearSession: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isHydrated: false,
  setSession: (accessToken, user) => {
    setAccessToken(accessToken);
    set({ accessToken, user });
  },
  clearSession: () => {
    setAccessToken(null);
    set({ accessToken: null, user: null });
  },
  setHydrated: () => set({ isHydrated: true }),
}));
