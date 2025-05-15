import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Edit2, Trash2 } from 'lucide-react-native';
import { Patient } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { getBmiCategory } from '@/utils/calculations';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { formatDate } from '@/utils/dateUtils';
import { TranslationKey } from '@/i18n/translations';

interface PatientCardProps {
  patient: Patient;
  onEdit: () => void;
}

export const PatientCard = ({ patient, onEdit }: PatientCardProps) => {
  const router = useRouter();
  const deletePatient = usePatientStore((state) => state.deletePatient);
  const { category, color } = getBmiCategory(patient.bmi || 0);
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();

  const handlePress = () => {
    router.push(`/patient/${patient.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      t('delete') + ' ' + t('patients').toLowerCase(),
      `${t('delete')} ${t('patients').toLowerCase()} ${t('id')}: ${patient.id}?`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          onPress: () => deletePatient(patient.id),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]} 
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
        <User 
          size={40} 
          color={patient.gender === 'male' ? colors.male : colors.female} 
          strokeWidth={1.5} 
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.id, { color: colors.textDark }]}>{t('id')}: {patient.id}</Text>
        <Text style={[styles.details, { color: colors.textLight }]}>
          {patient.age} {t('years')}, {patient.height} {t('cm')}, {patient.weight} {t('kg')}
        </Text>
        <View style={styles.bmiRow}>
          <Text style={[styles.bmi, { color: colors.primary }]}>
            {t('bmi')}: {patient.bmi}
          </Text>
          <View style={[styles.bmiCategoryBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.bmiCategoryText, { color }]}>{t(category as TranslationKey)}</Text>
          </View>
        </View>
        {patient.createdAt && (
          <Text style={[styles.dateAdded, { color: colors.textLight }]}>
            {t('added')}: {formatDate(patient.createdAt)}
          </Text>
        )}
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Edit2 size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  id: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    marginBottom: 2,
  },
  bmiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  bmi: {
    fontSize: 14,
    marginRight: 8,
  },
  bmiCategoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  bmiCategoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateAdded: {
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: 8,
  },
  actionButton: {
    padding: 8,
  },
});