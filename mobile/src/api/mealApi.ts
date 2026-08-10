import { apiClient } from './client';
import { AddAiEstimateToMealRequest, AddMealItemRequest, DailySummaryDto, MealEntryItemDto } from './types';

export const mealApi = {
  getDailySummary: (date: string) =>
    apiClient.get<DailySummaryDto>('/api/meals/daily-summary', { params: { date } }).then((res) => res.data),
  addItem: (payload: AddMealItemRequest) =>
    apiClient.post<MealEntryItemDto>('/api/meals/items', payload).then((res) => res.data),
  addAiEstimate: (payload: AddAiEstimateToMealRequest) =>
    apiClient.post<MealEntryItemDto>('/api/meals/items/from-ai', payload).then((res) => res.data),
  deleteItem: (id: string) => apiClient.delete(`/api/meals/items/${id}`).then(() => undefined),
};
