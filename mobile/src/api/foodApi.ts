import { apiClient } from './client';
import { CreateCustomFoodRequest, FoodDetailDto, FoodSearchResult } from './types';

export const foodApi = {
  search: (query: string, page = 1, pageSize = 20) =>
    apiClient
      .get<FoodSearchResult>('/api/foods', { params: { q: query || undefined, page, pageSize } })
      .then((res) => res.data),
  getById: (id: string) => apiClient.get<FoodDetailDto>(`/api/foods/${id}`).then((res) => res.data),
  createCustom: (payload: CreateCustomFoodRequest) =>
    apiClient.post<FoodDetailDto>('/api/foods', payload).then((res) => res.data),
};
