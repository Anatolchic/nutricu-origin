export interface Patient {
  id: string;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  age: number;
  hasDiabetes: boolean;
  hasKidneyFailure: boolean;
  hasRefeedingRisk: boolean;
  bmi?: number;
  idealWeight?: number;
  adjustedWeight?: number;
  calculationWeight?: number;
  createdAt?: number;
}

export interface NutritionDay {
  day: number;
  calories: number;
  protein: number;
  proteinWithKidneyFailure?: number;
  proteinWithDialysis?: number;
}

export interface NutritionPlan {
  days: NutritionDay[];
}