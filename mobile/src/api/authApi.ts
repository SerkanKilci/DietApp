import { apiClient } from './client';
import { AuthResponse, ExternalLoginRequest, LoginRequest, RefreshRequest, RegisterRequest, UserDto } from './types';

export const authApi = {
  register: (payload: RegisterRequest) =>
    apiClient.post<AuthResponse>('/api/auth/register', payload).then((res) => res.data),
  login: (payload: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/login', payload).then((res) => res.data),
  externalLogin: (payload: ExternalLoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/external-login', payload).then((res) => res.data),
  refresh: (payload: RefreshRequest) =>
    apiClient.post<AuthResponse>('/api/auth/refresh', payload).then((res) => res.data),
  logout: (payload: RefreshRequest) => apiClient.post('/api/auth/logout', payload).then(() => undefined),
  me: () => apiClient.get<UserDto>('/api/auth/me').then((res) => res.data),
};
