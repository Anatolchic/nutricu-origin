import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Edit2, Trash2, Calculator } from 'lucide-react-native';
import { Mixture } from '@/types/mixture';
import { useMixtureStore } from '@/store/mixtureStore';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { removeTrailingZeros } from '@/utils/calculations';

interface MixtureDetailsProps {
  mixture: Mixture;
}

export const MixtureDetails = ({ mixture }: MixtureDetailsProps) => {
  const router = useRouter();
  const deleteMixture = useMixtureStore((state) => state.deleteMixture);
  const [customVolume, setCustomVolume] = useState('500');
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();

  const handleEdit = () => {
    // Only allow editing if not a default mixture
    if (mixture.isDefault) {
      Alert.alert(
        t('attention'),
        t('cannotEditDefault'),
        [{ text: 'OK' }]
      );
      return;
    }
    router.push(`/edit-mixture/${mixture.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      t('delete') + ' ' + t('mixtures').toLowerCase(),
      `${t('delete')} "${mixture.name}"?`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          onPress: () => {
            deleteMixture(mixture.id);
            router.back();
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Calculate per 1ml values
  const caloriesPer1ml = removeTrailingZeros((mixture.caloriesPer1000ml / 1000).toFixed(3));
  const proteinPer1ml = removeTrailingZeros((mixture.proteinPer1000ml / 1000).toFixed(3));

  // Calculate custom volume values
  const customVolumeNum = parseFloat(customVolume) || 0;
  const caloriesForCustomVolume = (customVolumeNum * mixture.caloriesPer1000ml / 1000).toFixed(1);
  const proteinForCustomVolume = (customVolumeNum * mixture.proteinPer1000ml / 1000).toFixed(1);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <View style={[styles.mixtureInfoContainer, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: colors.primary }]}>{t('mixtureInfo')}</Text>
            <View style={styles.actionsContainer}>
              {!mixture.isDefault && (
                <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                  <Edit2 size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('mixtureName')}:</Text>
            <Text style={[styles.infoValue, { color: colors.textDark }]}>{mixture.name}</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('caloriesPer1000ml')}:</Text>
            <Text style={[styles.infoValue, { color: colors.textDark }]}>{mixture.caloriesPer1000ml} {t('kcal')}</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('energy')} / 1 {t('ml')}:</Text>
            <Text style={[styles.infoValue, { color: colors.textDark }]}>{caloriesPer1ml} {t('kcal')}</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('proteinPer1000ml')}:</Text>
            <Text style={[styles.infoValue, { color: colors.textDark }]}>{mixture.proteinPer1000ml} {t('g')}</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('protein')} / 1 {t('ml')}:</Text>
            <Text style={[styles.infoValue, { color: colors.textDark }]}>{proteinPer1ml} {t('g')}</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('forDiabetics')}:</Text>
            <Text style={[styles.infoValue, { color: colors.textDark }]}>{mixture.isDiabetic ? t('yes') : t('no')}</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textLight }]}>{t('semiElemental')}:</Text>
            <Text style={[styles.infoValue, { color: colors.textDark }]}>{mixture.isSemiElemental ? t('yes') : t('no')}</Text>
          </View>
        </View>
        
        <View style={[styles.calculationContainer, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Text style={[styles.title, { color: colors.primary }]}>{t('volumeCalculation')}</Text>
          
          <View style={[styles.calculationSection, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('customVolume')}</Text>
            <View style={styles.customVolumeInputContainer}>
              <Text style={[styles.customVolumeLabel, { color: colors.textDark }]}>{t('volume')}:</Text>
              <TextInput
                style={[styles.customVolumeInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.textDark }]}
                value={customVolume}
                onChangeText={setCustomVolume}
                keyboardType="numeric"
                placeholder={t('enterVolume')}
                placeholderTextColor={colors.textLight}
              />
              <Text style={[styles.customVolumeUnit, { color: colors.textDark }]}>{t('ml')}</Text>
            </View>
            <View style={[styles.customVolumeResultContainer, { backgroundColor: colors.primaryLight + '20' }]}>
              <View style={styles.customVolumeResultItem}>
                <Calculator size={20} color={colors.primary} />
                <Text style={[styles.customVolumeResultText, { color: colors.textDark }]}>
                  {caloriesForCustomVolume} {t('kcal')}
                </Text>
              </View>
              <View style={styles.customVolumeResultItem}>
                <Calculator size={20} color={colors.primary} />
                <Text style={[styles.customVolumeResultText, { color: colors.textDark }]}>
                  {proteinForCustomVolume} {t('g')} {t('protein')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  mixtureInfoContainer: {
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
    flex: 1,
    textAlign: 'right',
  },
  calculationContainer: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calculationSection: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  customVolumeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customVolumeLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  customVolumeInput: {
    borderRadius: 8,
    padding: 10,
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 8,
    textAlign: 'center',
  },
  customVolumeUnit: {
    fontSize: 16,
  },
  customVolumeResultContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  customVolumeResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'center',
  },
  customVolumeResultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});