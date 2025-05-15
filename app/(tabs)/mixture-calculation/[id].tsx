import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Copy, Share2, MinusCircle, PlusCircle, ArrowUp, ArrowDown, Check, Square } from 'lucide-react-native';
import { Patient, NutritionDay } from '@/types/patient';
import { Mixture } from '@/types/mixture';
import { usePatientStore } from '@/store/patientStore';
import { useMixtureStore } from '@/store/mixtureStore';
import { calculateNutritionPlan, getBmiCategory } from '@/utils/calculations';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { TranslationKey } from '@/i18n/translations';

// Type for volume adjustments
interface VolumeAdjustments {
  [dayId: string]: {
    [mixtureId: string]: number;
  };
}

export default function MixtureCalculationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const id = params.id as string;
  const mixtureIdsParam = params.mixtures as string;
  const mixtureIds = mixtureIdsParam ? mixtureIdsParam.split(',') : [];
  
  const getPatient = usePatientStore((state) => state.getPatient);
  const getMixture = useMixtureStore((state) => state.getMixture);
  const { colors } = useThemeStore();
  const { t, language } = useLanguageStore();
  
  const patient = getPatient(id);
  const selectedMixtures = mixtureIds
    .map(mixtureId => getMixture(mixtureId))
    .filter((mixture): mixture is Mixture => mixture !== undefined);
  
  // State to track volume adjustments
  const [volumeAdjustments, setVolumeAdjustments] = useState<VolumeAdjustments>({});
  
  // State to track which mixtures are selected for export for each day
  const [selectedForExport, setSelectedForExport] = useState<Record<string, string>>({});
  
  // State to track if initialization has been done
  const [initialized, setInitialized] = useState(false);
  
  // Get nutrition plan once
  const nutritionPlan = patient ? calculateNutritionPlan(patient) : { days: [] };
  
  // Initialize volume adjustments with calculated values
  useEffect(() => {
    if (!initialized && nutritionPlan && nutritionPlan.days.length > 0 && selectedMixtures.length > 0) {
      const initialAdjustments: VolumeAdjustments = {};
      const initialSelected: Record<string, string> = {};
      
      // For each day, calculate volumes for all mixtures
      nutritionPlan.days.forEach(day => {
        const dayId = day.day.toString();
        initialAdjustments[dayId] = {};
        
        // Calculate initial volume for all mixtures
        selectedMixtures.forEach(mixture => {
          const { requiredVolume } = calculateDailyVolume(day, mixture, 0);
          initialAdjustments[dayId][mixture.id] = requiredVolume;
        });
        
        // Initialize with no mixture selected for export
        initialSelected[dayId] = '';
      });
      
      setVolumeAdjustments(initialAdjustments);
      setSelectedForExport(initialSelected);
      setInitialized(true);
    }
  }, [nutritionPlan, selectedMixtures, initialized]);
  
  const calculateDailyVolume = useCallback((day: NutritionDay, mixture: Mixture, adjustment: number = 0) => {
    const caloriesPerMl = mixture.caloriesPer1000ml / 1000;
    const proteinPerMl = mixture.proteinPer1000ml / 1000;
    
    // Calculate required volume based on daily calorie needs
    let requiredVolume = Math.round(day.calories / caloriesPerMl);
    
    // Apply any custom adjustment
    if (volumeAdjustments[day.day]?.[mixture.id] !== undefined) {
      requiredVolume = volumeAdjustments[day.day][mixture.id];
    } else if (adjustment !== 0) {
      requiredVolume += adjustment;
    }
    
    // Ensure volume is never negative
    requiredVolume = Math.max(0, requiredVolume);
    
    // Calculate protein that would be provided by this volume
    const providedProtein = parseFloat((requiredVolume * proteinPerMl).toFixed(1));
    
    // Calculate calories that would be provided by this volume
    const providedCalories = Math.round(requiredVolume * caloriesPerMl);
    
    // Calculate target protein (accounting for kidney failure if needed)
    const targetProtein = patient && patient.hasKidneyFailure && day.proteinWithKidneyFailure 
      ? day.proteinWithKidneyFailure 
      : day.protein;
    
    // Calculate protein deviation percentage
    const proteinDeviation = parseFloat(((providedProtein / targetProtein * 100) - 100).toFixed(1));
    
    // Calculate calorie deviation percentage
    const calorieDeviation = parseFloat(((providedCalories / day.calories * 100) - 100).toFixed(1));
    
    return {
      requiredVolume,
      providedProtein,
      providedCalories,
      targetProtein,
      targetCalories: day.calories,
      proteinDeviation,
      calorieDeviation
    };
  }, [volumeAdjustments, patient]);
  
  const handleVolumeAdjustment = useCallback((day: number, mixtureId: string, adjustment: number) => {
    setVolumeAdjustments(prev => {
      const newAdjustments = { ...prev };
      
      if (!newAdjustments[day]) {
        newAdjustments[day] = {};
      }
      
      // Get current volume or calculate it if not yet adjusted
      let currentVolume = newAdjustments[day][mixtureId];
      if (currentVolume === undefined) {
        const mixture = selectedMixtures.find(m => m.id === mixtureId);
        if (mixture) {
          const dayData = nutritionPlan.days.find(d => d.day === day);
          if (dayData) {
            const { requiredVolume } = calculateDailyVolume(dayData, mixture);
            currentVolume = requiredVolume;
          }
        }
      }
      
      // Apply adjustment (minimum 0ml)
      if (currentVolume !== undefined) {
        newAdjustments[day][mixtureId] = Math.max(0, currentVolume + adjustment);
      }
      
      return newAdjustments;
    });
  }, [calculateDailyVolume, nutritionPlan.days, selectedMixtures]);
  
  const toggleMixtureSelection = useCallback((dayId: string, mixtureId: string) => {
    setSelectedForExport(prev => {
      const newSelected = { ...prev };
      
      // If this mixture is already selected, deselect it
      if (newSelected[dayId] === mixtureId) {
        newSelected[dayId] = '';
      } else {
        // Otherwise select it (and deselect any other mixture for this day)
        newSelected[dayId] = mixtureId;
      }
      
      return newSelected;
    });
  }, []);
  
  const getDeviationColor = useCallback((deviation: number) => {
    const absDeviation = Math.abs(deviation);
    if (absDeviation <= 7) return colors.success; // Within 7% of target
    if (absDeviation <= 15) return colors.warning; // Between 7% and 15% of target
    return colors.error; // More than 15% from target
  }, [colors]);
  
  const getDeviationText = useCallback((deviation: number) => {
    if (deviation < 0) return `${Math.abs(deviation)}% ${t('belowNorm')}`;
    if (deviation > 0) return `${deviation}% ${t('aboveNorm')}`;
    return t('matchesNorm');
  }, [t]);
  
  const formatCalculationAsText = useCallback(() => {
    if (!patient) return '';
    
    // Start with patient information header
    let text = `${t('id')} ${t('patients').toLowerCase()}: ${patient.id}
${t('gender')}: ${patient.gender === 'male' ? t('male') : t('female')}
${t('age')}: ${patient.age} ${t('years')}
${t('height')}: ${patient.height} ${t('cm')}
${t('actualWeight')}: ${patient.weight} ${t('kg')}
`;

    if (patient.bmi) {
      const { category } = getBmiCategory(patient.bmi);
      text += `${t('bmi')}: ${patient.bmi} ${t('kgm2')} (${t(category as TranslationKey)})
`;
    }

    if (patient.idealWeight) {
      text += `${t('idealWeight')}: ${patient.idealWeight} ${t('kg')}
`;
    }

    if (patient.adjustedWeight) {
      text += `${t('adjustedWeight')}: ${patient.adjustedWeight} ${t('kg')}
`;
    }

    if (patient.calculationWeight) {
      text += `${t('calculationWeight')}: ${patient.calculationWeight} ${t('kg')}
`;
    }

    text += `${t('diabetes')}: ${patient.hasDiabetes ? t('yes') : t('no')}
${t('kidneyFailure')}: ${patient.hasKidneyFailure ? t('yes') : t('no')}
${t('refeedingRisk')}: ${patient.hasRefeedingRisk ? t('yes') : t('no')}

`;
    
    // Add nutrition plan information directly without the "Nutrition Calculation for patient" line
    text += `${t('nutritionPlan')}:
`;
    nutritionPlan.days.forEach(day => {
      const dayId = day.day.toString();
      
      // Get the mixture selected for export for this day (if any)
      const selectedMixtureId = selectedForExport[dayId];
      
      // If no mixture is selected for this day, include all mixtures
      if (!selectedMixtureId) {
        text += `${t('day')} ${day.day}:
`;
        text += `- ${t('requirement')}: ${day.calories} ${t('kcal')}, `;
        
        const targetProtein = patient.hasKidneyFailure && day.proteinWithKidneyFailure 
          ? day.proteinWithKidneyFailure 
          : day.protein;
        
        // Use genitive case for protein in Russian
        const proteinWord = language === 'ru' ? t('proteinGenitive') : t('protein');
        
        text += `${targetProtein} ${t('g')} ${proteinWord}
`;
        
        // Include all mixtures for this day
        selectedMixtures.forEach(mixture => {
          // Use adjusted volume if available
          const adjustedVolume = volumeAdjustments[dayId]?.[mixture.id];
          const { requiredVolume } = calculateDailyVolume(day, mixture, 0);
          
          const actualVolume = adjustedVolume !== undefined ? adjustedVolume : requiredVolume;
          const actualCalories = Math.round((actualVolume * mixture.caloriesPer1000ml) / 1000);
          const actualProtein = parseFloat(((actualVolume * mixture.proteinPer1000ml) / 1000).toFixed(1));
          const actualCalorieDeviation = parseFloat(((actualCalories / day.calories * 100) - 100).toFixed(1));
          const actualProteinDeviation = parseFloat(((actualProtein / targetProtein * 100) - 100).toFixed(1));
          
          text += `  * ${mixture.name}:
`;
          text += `    - ${t('volume')}: ${actualVolume} ${t('ml')}
`;
          text += `    - ${t('energy')}: ${actualCalories} ${t('kcal')} (`;
          
          if (actualCalorieDeviation < 0) {
            text += `${Math.abs(actualCalorieDeviation)}% ${t('belowNorm')})
`;
          } else if (actualCalorieDeviation > 0) {
            text += `${actualCalorieDeviation}% ${t('aboveNorm')})
`;
          } else {
            text += `${t('matchesNorm')})
`;
          }
          
          text += `    - ${t('protein')}: ${actualProtein} ${t('g')} (`;
          
          if (actualProteinDeviation < 0) {
            text += `${Math.abs(actualProteinDeviation)}% ${t('belowNorm')})
`;
          } else if (actualProteinDeviation > 0) {
            text += `${actualProteinDeviation}% ${t('aboveNorm')})
`;
          } else {
            text += `${t('matchesNorm')})
`;
          }
        });
        
        text += `
`;
        return;
      }
      
      // If a specific mixture is selected for this day, only include that one
      const mixture = selectedMixtures.find(m => m.id === selectedMixtureId);
      if (!mixture) return; // Skip if mixture not found
      
      text += `${t('day')} ${day.day}:
`;
      text += `- ${t('requirement')}: ${day.calories} ${t('kcal')}, `;
      
      const targetProtein = patient.hasKidneyFailure && day.proteinWithKidneyFailure 
        ? day.proteinWithKidneyFailure 
        : day.protein;
      
      // Use genitive case for protein in Russian
      const proteinWord = language === 'ru' ? t('proteinGenitive') : t('protein');
      
      text += `${targetProtein} ${t('g')} ${proteinWord}
`;
      
      // Use adjusted volume if available
      const adjustedVolume = volumeAdjustments[dayId]?.[selectedMixtureId];
      const { requiredVolume } = calculateDailyVolume(day, mixture, 0);
      
      const actualVolume = adjustedVolume !== undefined ? adjustedVolume : requiredVolume;
      const actualCalories = Math.round((actualVolume * mixture.caloriesPer1000ml) / 1000);
      const actualProtein = parseFloat(((actualVolume * mixture.proteinPer1000ml) / 1000).toFixed(1));
      const actualCalorieDeviation = parseFloat(((actualCalories / day.calories * 100) - 100).toFixed(1));
      const actualProteinDeviation = parseFloat(((actualProtein / targetProtein * 100) - 100).toFixed(1));
      
      text += `  * ${mixture.name}:
`;
      text += `    - ${t('volume')}: ${actualVolume} ${t('ml')}
`;
      text += `    - ${t('energy')}: ${actualCalories} ${t('kcal')} (`;
      
      if (actualCalorieDeviation < 0) {
        text += `${Math.abs(actualCalorieDeviation)}% ${t('belowNorm')})
`;
      } else if (actualCalorieDeviation > 0) {
        text += `${actualCalorieDeviation}% ${t('aboveNorm')})
`;
      } else {
        text += `${t('matchesNorm')})
`;
      }
      
      text += `    - ${t('protein')}: ${actualProtein} ${t('g')} (`;
      
      if (actualProteinDeviation < 0) {
        text += `${Math.abs(actualProteinDeviation)}% ${t('belowNorm')})
`;
      } else if (actualProteinDeviation > 0) {
        text += `${actualProteinDeviation}% ${t('aboveNorm')})
`;
      } else {
        text += `${t('matchesNorm')})
`;
      }
      
      text += `
`;
    });
    
    if (patient.hasRefeedingRisk) {
      text += `${t('refeedingWarning')}
`;
      text += `${t('refeedingInstructions')}
`;
    }
    
    if (patient.hasKidneyFailure) {
      text += `
${t('kidneyWarning')}
`;
      text += `${t('kidneyInstructions')}
`;
    }
    
    return text;
  }, [patient, nutritionPlan, selectedForExport, selectedMixtures, volumeAdjustments, calculateDailyVolume, t, language]);
  
  const handleCopyInfo = useCallback(async () => {
    const text = formatCalculationAsText();
    
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
      } else {
        await Clipboard.setStringAsync(text);
      }
      Alert.alert(t('success'), t('copySuccess'));
    } catch (err) {
      Alert.alert(t('error'), t('copyFailed'));
    }
  }, [formatCalculationAsText, t]);
  
  const handleShareInfo = useCallback(async () => {
    const text = formatCalculationAsText();
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: `${t('nutritionCalculation')} ${patient?.id}`,
            text: text
          });
        } else {
          // Fallback for web browsers that don't support sharing
          await navigator.clipboard.writeText(text);
          Alert.alert(t('copy'), t('copySuccess'));
        }
      } else {
        // Create a temporary file
        const fileUri = FileSystem.documentDirectory + `nutrition_calculation_${patient?.id}.txt`;
        
        // Write the text content to the file
        await FileSystem.writeAsStringAsync(fileUri, text);
        
        // Share the file
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: t('share'),
          UTI: 'public.plain-text' // for iOS
        });
      }
    } catch (err) {
      console.error('Sharing error:', err);
      // Fallback to clipboard if sharing fails
      try {
        if (Platform.OS === 'web') {
          await navigator.clipboard.writeText(text);
        } else {
          await Clipboard.setStringAsync(text);
        }
        Alert.alert(t('copy'), t('copySuccess'));
      } catch (clipboardErr) {
        Alert.alert(t('error'), t('shareFailed'));
      }
    }
  }, [formatCalculationAsText, patient, t]);
  
  const handleBack = useCallback(() => {
    // Navigate explicitly to the mixture selection screen
    router.push(`/select-mixtures/${id}`);
  }, [router, id]);
  
  if (!patient || selectedMixtures.length === 0 || !initialized) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textDark }}>{t('loading')}</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.primary }]}>{t('volumeCalculation')}</Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            {t('patientInfo')}: {patient.id}
          </Text>
        </View>
        
        <View style={[styles.calculationContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('nutritionPlan')}</Text>
          
          {nutritionPlan.days.map(day => {
            const dayId = day.day.toString();
            const targetProtein = patient.hasKidneyFailure && day.proteinWithKidneyFailure 
              ? day.proteinWithKidneyFailure 
              : day.protein;
            
            // Get the mixture selected for export for this day (if any)
            const selectedMixtureId = selectedForExport[dayId] || '';
            
            return (
              <View key={day.day} style={[styles.dayContainer, { borderColor: colors.border }]}>
                <View style={[styles.dayHeader, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.dayTitle}>{t('day')} {day.day}</Text>
                </View>
                
                <View style={[styles.dayContent, { backgroundColor: colors.card }]}>
                  <View style={styles.dayRow}>
                    <Text style={[styles.dayLabel, styles.boldText, { color: colors.textLight }]}>{t('requirement')}:</Text>
                    <Text style={[styles.dayValueBold, { color: colors.textDark }]}>
                      {day.calories} {t('kcal')}, {targetProtein} {t('g')} {language === 'ru' ? t('proteinGenitive') : t('protein')}
                    </Text>
                  </View>
                  
                  {/* Display all selected mixtures for this day */}
                  {selectedMixtures.map(mixture => {
                    // Get adjusted volume if available
                    const adjustedVolume = volumeAdjustments[dayId]?.[mixture.id];
                    
                    // Calculate with the adjusted volume
                    const { 
                      requiredVolume, 
                      providedProtein, 
                      providedCalories,
                      proteinDeviation,
                      calorieDeviation
                    } = calculateDailyVolume(day, mixture, 0);
                    
                    // Use adjusted volume if available, otherwise use calculated volume
                    const displayVolume = adjustedVolume !== undefined ? adjustedVolume : requiredVolume;
                    
                    // Recalculate values based on adjusted volume
                    const displayCalories = Math.round((displayVolume * mixture.caloriesPer1000ml) / 1000);
                    const displayProtein = parseFloat(((displayVolume * mixture.proteinPer1000ml) / 1000).toFixed(1));
                    const displayCalorieDeviation = parseFloat(((displayCalories / day.calories * 100) - 100).toFixed(1));
                    const displayProteinDeviation = parseFloat(((displayProtein / targetProtein * 100) - 100).toFixed(1));
                    
                    // Check if this mixture is selected for export
                    const isSelected = selectedMixtureId === mixture.id;
                    
                    return (
                      <View key={mixture.id} style={styles.mixtureCalculation}>
                        <View style={styles.mixtureNameRow}>
                          <TouchableOpacity 
                            style={styles.checkboxContainer}
                            onPress={() => toggleMixtureSelection(dayId, mixture.id)}
                          >
                            {isSelected ? (
                              <Check size={20} color={colors.primary} />
                            ) : (
                              <Square size={20} color={colors.textLight} />
                            )}
                          </TouchableOpacity>
                          
                          <Text style={[styles.mixtureName, { color: colors.primary }]}>{mixture.name}</Text>
                        </View>
                        
                        <View style={styles.volumeAdjustRow}>
                          <Text style={[styles.dayLabel, { color: colors.textLight }]}>{t('volume')}:</Text>
                          <View style={styles.volumeAdjuster}>
                            <TouchableOpacity 
                              style={styles.volumeButton}
                              onPress={() => handleVolumeAdjustment(day.day, mixture.id, -10)}
                            >
                              <MinusCircle size={24} color={colors.primary} />
                            </TouchableOpacity>
                            
                            <Text style={[styles.volumeValue, { color: colors.textDark }]}>{displayVolume} {t('ml')}</Text>
                            
                            <TouchableOpacity 
                              style={styles.volumeButton}
                              onPress={() => handleVolumeAdjustment(day.day, mixture.id, 10)}
                            >
                              <PlusCircle size={24} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        
                        <View style={styles.dayRow}>
                          <Text style={[styles.dayLabel, { color: colors.textLight }]}>{t('energy')}:</Text>
                          <View style={styles.proteinContainer}>
                            <Text style={[styles.dayValue, { color: colors.textDark }]}>{displayCalories} {t('kcal')}</Text>
                            <View style={[
                              styles.deviationBadge,
                              { backgroundColor: getDeviationColor(displayCalorieDeviation) + '20' }
                            ]}>
                              {displayCalorieDeviation !== 0 && (
                                displayCalorieDeviation > 0 ? (
                                  <ArrowUp size={12} color={getDeviationColor(displayCalorieDeviation)} style={styles.deviationArrow} strokeWidth={3} />
                                ) : (
                                  <ArrowDown size={12} color={getDeviationColor(displayCalorieDeviation)} style={styles.deviationArrow} strokeWidth={3} />
                                )
                              )}
                              <Text style={[
                                styles.deviationText,
                                { color: getDeviationColor(displayCalorieDeviation) }
                              ]}>
                                {getDeviationText(displayCalorieDeviation)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        <View style={styles.dayRow}>
                          <Text style={[styles.dayLabel, { color: colors.textLight }]}>{t('protein')}:</Text>
                          <View style={styles.proteinContainer}>
                            <Text style={[styles.dayValue, { color: colors.textDark }]}>{displayProtein} {t('g')}</Text>
                            <View style={[
                              styles.deviationBadge,
                              { backgroundColor: getDeviationColor(displayProteinDeviation) + '20' }
                            ]}>
                              {displayProteinDeviation !== 0 && (
                                displayProteinDeviation > 0 ? (
                                  <ArrowUp size={12} color={getDeviationColor(displayProteinDeviation)} style={styles.deviationArrow} strokeWidth={3} />
                                ) : (
                                  <ArrowDown size={12} color={getDeviationColor(displayProteinDeviation)} style={styles.deviationArrow} strokeWidth={3} />
                                )
                              )}
                              <Text style={[
                                styles.deviationText,
                                { color: getDeviationColor(displayProteinDeviation) }
                              ]}>
                                {getDeviationText(displayProteinDeviation)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        {/* Add a separator between mixtures */}
                        {mixture.id !== selectedMixtures[selectedMixtures.length - 1].id && (
                          <View style={[styles.mixtureSeparator, { backgroundColor: colors.border }]} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
          
          {patient.hasRefeedingRisk && (
            <View style={[styles.refeedingWarning, { borderColor: colors.error, backgroundColor: colors.error + '10' }]}>
              <Text style={[styles.refeedingTitle, { color: colors.error }]}>
                {t('refeedingWarning')}
              </Text>
              <Text style={[styles.refeedingText, { color: colors.textDark }]}>
                {t('refeedingInstructions')}
              </Text>
            </View>
          )}
          
          {patient.hasKidneyFailure && (
            <View style={[styles.kidneyWarning, { borderColor: colors.error, backgroundColor: colors.error + '10' }]}>
              <Text style={[styles.kidneyWarningTitle, { color: colors.error }]}>
                {t('kidneyWarning')}
              </Text>
              <Text style={[styles.kidneyWarningText, { color: colors.textDark }]}>
                {t('kidneyInstructions')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <ArrowLeft size={20} color={colors.primary} />
          <Text style={[styles.backButtonText, { color: colors.primary }]}>{t('back')}</Text>
        </TouchableOpacity>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleCopyInfo}>
            <Copy size={20} color="white" />
            <Text style={styles.actionButtonText}>{t('copy')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={handleShareInfo}>
            <Share2 size={20} color="white" />
            <Text style={styles.actionButtonText}>{t('share')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  calculationContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dayContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dayHeader: {
    padding: 8,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  dayContent: {
    padding: 12,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  volumeAdjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  volumeAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeButton: {
    padding: 4,
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 8,
    minWidth: 60,
    textAlign: 'center',
  },
  dayLabel: {
    fontSize: 14,
  },
  boldText: {
    fontWeight: 'bold',
  },
  dayValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayValueBold: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  mixtureCalculation: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  mixtureSeparator: {
    height: 1,
    marginVertical: 12,
  },
  mixtureNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxContainer: {
    marginRight: 8,
  },
  mixtureName: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  proteinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviationBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviationArrow: {
    marginRight: 2,
  },
  deviationText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  refeedingWarning: {
    marginTop: 16,
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
  },
  refeedingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  refeedingText: {
    fontSize: 14,
    marginBottom: 4,
  },
  kidneyWarning: {
    marginTop: 16,
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
  },
  kidneyWarningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  kidneyWarningText: {
    fontSize: 14,
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});