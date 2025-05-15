import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Edit2, Trash2, Copy, Share2, Beaker } from 'lucide-react-native';
import { Patient } from '@/types/patient';
import { calculateNutritionPlan, formatPatientDataAsText, getBmiCategory } from '@/utils/calculations';
import { usePatientStore } from '@/store/patientStore';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { TranslationKey } from '@/i18n/translations';

interface NutritionPlanProps {
  patient: Patient;
}

export const NutritionPlan = ({ patient }: NutritionPlanProps) => {
  const router = useRouter();
  const deletePatient = usePatientStore((state) => state.deletePatient);
  const nutritionPlan = calculateNutritionPlan(patient);
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();

  const handleCopyInfo = async () => {
    const text = formatPatientDataAsText(patient);
    
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
  };

  const handleShareInfo = async () => {
    const text = formatPatientDataAsText(patient);
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: `${t('patientInfo')} ${patient.id}`,
            text: text
          });
        } else {
          // Fallback for web browsers that don't support sharing
          await navigator.clipboard.writeText(text);
          Alert.alert(t('copy'), t('copySuccess'));
        }
      } else {
        // Create a temporary file
        const fileUri = FileSystem.documentDirectory + `patient_${patient.id}.txt`;
        
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
  };

  const handleSelectMixtures = () => {
    router.push(`/select-mixtures/${patient.id}`);
  };

  const handleEdit = () => {
    router.push(`/edit/${patient.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      t('delete') + ' ' + t('patients').toLowerCase(),
      `${t('delete')} ${t('patients').toLowerCase()} ${patient.id}?`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          onPress: () => {
            deletePatient(patient.id);
            router.back();
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Get BMI category and color
  const { category, color } = getBmiCategory(patient.bmi || 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.patientInfoContainer, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.primary }]}>{t('patientInfo')}</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Edit2 size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('id')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.id}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('gender')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.gender === 'male' ? t('male') : t('female')}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('age')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.age} {t('years')}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('height')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.height} {t('cm')}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('actualWeight')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.weight} {t('kg')}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('bmi')}:</Text>
          <View style={styles.bmiContainer}>
            <View style={[styles.bmiCategoryBadge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.bmiCategoryText, { color }]}>{t(category as TranslationKey)}</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.bmi} {t('kgm2')}</Text>
          </View>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('idealWeight')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.idealWeight} {t('kg')}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('adjustedWeight')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.adjustedWeight} {t('kg')}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('calculationWeight')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.calculationWeight} {t('kg')}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('diabetes')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.hasDiabetes ? t('yes') : t('no')}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('kidneyFailure')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.hasKidneyFailure ? t('yes') : t('no')}</Text>
        </View>
        
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('refeedingRisk')}:</Text>
          <Text style={[styles.infoValue, { color: colors.textDark }]}>{patient.hasRefeedingRisk ? t('yes') : t('no')}</Text>
        </View>
      </View>
      
      <View style={[styles.nutritionContainer, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <Text style={[styles.title, { color: colors.primary }]}>{t('nutritionPlan')}</Text>
        
        {nutritionPlan.days.map((day) => (
          <View key={day.day} style={[styles.dayContainer, { borderColor: colors.border }]}>
            <Text style={[styles.dayTitle, { backgroundColor: colors.primaryLight, color: 'white' }]}>{t('day')} {day.day}</Text>
            <View style={styles.dayContent}>
              <View style={styles.nutritionRow}>
                <Text style={[styles.nutritionLabel, { color: colors.textLight }]}>{t('energy')}:</Text>
                <Text style={[styles.nutritionValue, { color: colors.textDark }]}>{day.calories} {t('kcal')}</Text>
              </View>
              
              {patient.hasKidneyFailure ? (
                <>
                  <View style={styles.nutritionRow}>
                    <Text style={[styles.nutritionLabel, { color: colors.textLight }]}>
                      {t('protein')}:
                    </Text>
                    <Text style={[styles.nutritionValue, { color: colors.textDark }]}>
                      {day.proteinWithKidneyFailure} {t('g')}
                    </Text>
                  </View>
                  <View style={styles.nutritionRow}>
                    <Text style={[styles.nutritionLabel, styles.dialysisText, { color: colors.error }]}>
                      {t('ifDialysis')}:
                    </Text>
                    <Text style={[styles.nutritionValue, styles.dialysisText, { color: colors.error }]}>
                      {day.proteinWithDialysis} {t('g')}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.nutritionRow}>
                  <Text style={[styles.nutritionLabel, { color: colors.textLight }]}>{t('protein')}:</Text>
                  <Text style={[styles.nutritionValue, { color: colors.textDark }]}>{day.protein} {t('g')}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
        
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
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleCopyInfo}>
            <View style={styles.buttonContent}>
              <Copy size={20} color="white" />
              <Text style={styles.buttonText}>{t('copy')}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleShareInfo}>
            <View style={styles.buttonContent}>
              <Share2 size={20} color="white" />
              <Text style={styles.buttonText}>{t('share')}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={[styles.selectMixturesButton, { backgroundColor: colors.primaryDark }]} onPress={handleSelectMixtures}>
          <View style={styles.buttonContent}>
            <Beaker size={20} color="white" />
            <Text style={styles.buttonText}>{t('selectMixture')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  patientInfoContainer: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  nutritionContainer: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 16,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bmiCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  bmiCategoryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dayContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 8,
    textAlign: 'center',
  },
  dayContent: {
    padding: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  nutritionLabel: {
    fontSize: 16,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  dialysisText: {
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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  selectMixturesButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
});