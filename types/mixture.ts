export interface Mixture {
  id: string;
  name: string;
  caloriesPer1000ml: number;
  proteinPer1000ml: number;
  isDiabetic: boolean;
  isSemiElemental: boolean;
  isDefault?: boolean; // New property to indicate default mixtures
}