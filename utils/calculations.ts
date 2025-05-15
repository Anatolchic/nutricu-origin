import { Patient, NutritionPlan, NutritionDay } from '@/types/patient';
import { colors } from '@/constants/colors';
import { useLanguageStore } from '@/store/languageStore';
import { TranslationKey } from '@/i18n/translations';

// Calculate BMI
export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

// Get BMI category and color
export const getBmiCategory = (bmi: number): { category: string; color: string } => {
  if (bmi < 16) {
    return { category: 'severeDef', color: colors.error };
  } else if (bmi < 18.5) {
    return { category: 'deficit', color: '#FF9800' }; // Orange
  } else if (bmi < 25) {
    return { category: 'normal', color: colors.success };
  } else if (bmi < 30) {
    return { category: 'overweight', color: '#FF9800' }; // Orange
  } else if (bmi < 35) {
    return { category: 'obesity1', color: colors.error };
  } else if (bmi < 40) {
    return { category: 'obesity2', color: colors.error };
  } else {
    return { category: 'obesity3', color: colors.error };
  }
};

// Calculate ideal weight using Devine formula
export const calculateIdealWeight = (height: number, gender: 'male' | 'female'): number => {
  if (gender === 'male') {
    return parseFloat((50 + 0.91 * (height - 152.4)).toFixed(1));
  } else {
    return parseFloat((45.5 + 0.91 * (height - 152.4)).toFixed(1));
  }
};

// Calculate adjusted weight
export const calculateAdjustedWeight = (actualWeight: number, idealWeight: number): number => {
  return parseFloat((0.4 * (actualWeight - idealWeight) + idealWeight).toFixed(1));
};

// Determine which weight to use for calculations
export const getCalculationWeight = (patient: Patient): number => {
  const bmi = calculateBMI(patient.weight, patient.height);
  const idealWeight = calculateIdealWeight(patient.height, patient.gender);
  
  // If BMI indicates obesity (BMI >= 30), use adjusted weight
  if (bmi >= 30) {
    const adjustedWeight = calculateAdjustedWeight(patient.weight, idealWeight);
    return adjustedWeight;
  }
  
  // Otherwise use actual weight
  return patient.weight;
};

// Calculate nutrition plan for 7 days
export const calculateNutritionPlan = (patient: Patient): NutritionPlan => {
  const calculationWeight = getCalculationWeight(patient);
  
  const nutritionRules = [
    { day: 1, caloriesPerKg: 5, proteinPerKg: 0.325 },
    { day: 2, caloriesPerKg: 10, proteinPerKg: 0.65 },
    { day: 3, caloriesPerKg: 15, proteinPerKg: 0.975 },
    { day: 4, caloriesPerKg: 20, proteinPerKg: 1.3 },
    { day: 5, caloriesPerKg: 25, proteinPerKg: 1.3 },
    { day: 6, caloriesPerKg: 25, proteinPerKg: 1.4 },
    { day: 7, caloriesPerKg: 30, proteinPerKg: 1.5 },
  ];
  
  const days: NutritionDay[] = nutritionRules.map(rule => {
    const calories = Math.round(rule.caloriesPerKg * calculationWeight);
    const protein = parseFloat((rule.proteinPerKg * calculationWeight).toFixed(1));
    
    const day: NutritionDay = {
      day: rule.day,
      calories,
      protein,
    };
    
    // If patient has kidney failure, calculate reduced protein (20% less)
    if (patient.hasKidneyFailure) {
      day.proteinWithKidneyFailure = parseFloat((protein * 0.8).toFixed(1));
      day.proteinWithDialysis = parseFloat((protein * 1.2).toFixed(1));
    }
    
    return day;
  });
  
  return { days };
};

// Process patient data to include all calculated values
export const processPatientData = (patient: Patient): Patient => {
  const bmi = calculateBMI(patient.weight, patient.height);
  const idealWeight = calculateIdealWeight(patient.height, patient.gender);
  const adjustedWeight = calculateAdjustedWeight(patient.weight, idealWeight);
  const calculationWeight = getCalculationWeight({...patient, bmi, idealWeight, adjustedWeight});
  
  return {
    ...patient,
    bmi,
    idealWeight,
    adjustedWeight,
    calculationWeight
  };
};

// Format patient data as text for copying
export const formatPatientDataAsText = (patient: Patient): string => {
  const processedPatient = processPatientData(patient);
  const nutritionPlan = calculateNutritionPlan(processedPatient);
  const { category } = getBmiCategory(processedPatient.bmi || 0);
  const { t, language } = useLanguageStore.getState();
  
  let text = `${t('id')} ${t('patients').toLowerCase()}: ${patient.id}
`;
  text += `${t('gender')}: ${patient.gender === 'male' ? t('male') : t('female')}
`;
  text += `${t('age')}: ${patient.age} ${t('years')}
`;
  text += `${t('height')}: ${patient.height} ${t('cm')}
`;
  text += `${t('actualWeight')}: ${patient.weight} ${t('kg')}
`;
  text += `${t('bmi')}: ${processedPatient.bmi} ${t('kgm2')} (${t(category as TranslationKey)})
`;
  text += `${t('idealWeight')}: ${processedPatient.idealWeight} ${t('kg')}
`;
  text += `${t('adjustedWeight')}: ${processedPatient.adjustedWeight} ${t('kg')}
`;
  text += `${t('calculationWeight')}: ${processedPatient.calculationWeight} ${t('kg')}
`;
  text += `${t('diabetes')}: ${patient.hasDiabetes ? t('yes') : t('no')}
`;
  text += `${t('kidneyFailure')}: ${patient.hasKidneyFailure ? t('yes') : t('no')}
`;
  text += `${t('refeedingRisk')}: ${patient.hasRefeedingRisk ? t('yes') : t('no')}

`;
  
  text += `${t('nutritionPlan')}:
`;
  nutritionPlan.days.forEach(day => {
    text += `${t('day')} ${day.day}: ${day.calories} ${t('kcal')}, `;
    
    const targetProtein = patient.hasKidneyFailure && day.proteinWithKidneyFailure 
      ? day.proteinWithKidneyFailure 
      : day.protein;
    
    // Use genitive case for protein in Russian
    const proteinWord = language === 'ru' ? t('proteinGenitive') : t('protein');
    
    text += `${targetProtein} ${t('g')} ${proteinWord}
`;
    if (patient.hasKidneyFailure && day.proteinWithDialysis) {
      text += `  ${t('ifDialysis')}: ${day.proteinWithDialysis} ${t('g')} ${proteinWord}
`;
    }
  });
  
  if (patient.hasRefeedingRisk) {
    text += `
${t('refeedingWarning')}
`;
    text += `${t('refeedingInstructions')}
`;
  }
  
  return text;
};

// Remove trailing zeros from decimal numbers
export const removeTrailingZeros = (value: string): string => {
  return value.replace(/\.?0+$/, '');
};