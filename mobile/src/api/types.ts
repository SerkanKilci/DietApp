export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  isEmailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserDto;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type ExternalLoginProvider = 'Google' | 'Apple';

export interface ExternalLoginRequest {
  provider: ExternalLoginProvider;
  idToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export type Gender = 'Male' | 'Female';
export type ActivityLevel = 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'VeryActive';
export type Goal = 'Lose' | 'Maintain' | 'Gain';

export interface OnboardingRequest {
  heightCm: number;
  weightKg: number;
  birthDate: string; // "YYYY-MM-DD"
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
  goalWeightKg: number | null;
}

export interface NutritionGoalDto {
  dailyCalories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  effectiveFrom: string;
}

export interface ProfileDto {
  heightCm: number;
  weightKg: number;
  birthDate: string;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
  goalWeightKg: number | null;
  nutritionGoal: NutritionGoalDto;
}

export interface SetCustomNutritionGoalRequest {
  dailyCalories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}

export type FoodSource = 'Usda' | 'OpenFoodFacts' | 'UserCreated';

export interface FoodListItemDto {
  id: string;
  name: string;
  brand: string | null;
  source: FoodSource;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
}

export interface FoodMicronutrientDto {
  nutrientCode: string;
  amountPer100g: number;
  unit: string;
}

export interface FoodDetailDto {
  id: string;
  name: string;
  brand: string | null;
  source: FoodSource;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
  sugarPer100g: number | null;
  sodiumMgPer100g: number | null;
  isCustom: boolean;
  micronutrients: FoodMicronutrientDto[];
}

export interface FoodSearchResult {
  items: FoodListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateCustomFoodRequest {
  name: string;
  brand: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbPer100g: number;
  fatPer100g: number;
  fiberPer100g: number | null;
  sugarPer100g: number | null;
  sodiumMgPer100g: number | null;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface AddMealItemRequest {
  logDate: string; // "YYYY-MM-DD"
  mealType: MealType;
  foodItemId: string;
  quantityG: number;
}

export interface MealEntryItemDto {
  id: string;
  foodItemId: string | null;
  foodName: string;
  quantityG: number;
  caloriesTotal: number;
  proteinTotal: number;
  carbTotal: number;
  fatTotal: number;
  isAiEstimated: boolean;
}

export interface MealGroupDto {
  mealType: MealType;
  items: MealEntryItemDto[];
  totalCalories: number;
}

export interface DailySummaryDto {
  logDate: string;
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarb: number;
  consumedFat: number;
  remainingCalories: number;
  meals: MealGroupDto[];
}

export interface AnalyzePlateResponse {
  analysisId: string;
  description: string;
  estimatedCalories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}

export interface AddAiEstimateToMealRequest {
  logDate: string;
  mealType: MealType;
  aiPlateAnalysisId: string;
  description: string;
  calories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}
