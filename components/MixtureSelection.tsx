import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Check, ArrowRight, Beaker, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { Patient } from '@/types/patient';
import { Mixture } from '@/types/mixture';
import { useMixtureStore } from '@/store/mixtureStore';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';

interface MixtureSelectionProps {
  patient: Patient;
}

export const MixtureSelection = ({ patient }: MixtureSelectionProps) => {
  const router = useRouter();
  const mixtures = useMixtureStore((state) => state.mixtures);
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();
  
  // Store selected mixture IDs
  const [selectedMixtures, setSelectedMixtures] = useState<string[]>([]);
  
  const toggleMixtureSelection = (mixtureId: string) => {
    setSelectedMixtures(prev => {
      if (prev.includes(mixtureId)) {
        return prev.filter(id => id !== mixtureId);
      } else {
        return [...prev, mixtureId];
      }
    });
  };

  const handleCalculate = () => {
    if (selectedMixtures.length === 0) {
      Alert.alert(t('attention'), t('selectMixture'));
      return;
    }
    
    // Pass the patient ID and the selected mixture IDs
    router.push(`/mixture-calculation/${patient.id}?mixtures=${selectedMixtures.join(',')}`);
  };

  const handleBack = () => {
    // Navigate explicitly to the patient details screen
    router.push(`/patient/${patient.id}`);
  };

  // Check if patient has diabetes but non-diabetic mixtures are selected
  const hasDiabeticWarning = () => {
    if (!patient.hasDiabetes) return false;
    
    // Get selected mixture objects
    const selectedMixtureObjects = selectedMixtures
      .map(id => mixtures.find(m => m.id === id))
      .filter(Boolean) as Mixture[];
    
    // Check if any selected mixture is NOT for diabetics
    return selectedMixtureObjects.length > 0 && 
           selectedMixtureObjects.some(m => !m.isDiabetic);
  };

  // Check if any semi-elemental mixture is selected
  const hasSemiElementalWarning = () => {
    const selectedMixtureObjects = selectedMixtures
      .map(id => mixtures.find(m => m.id === id))
      .filter(Boolean) as Mixture[];
    
    return selectedMixtureObjects.some(m => m.isSemiElemental);
  };

  const renderMixtureItem = ({ item }: { item: Mixture }) => {
    const isSelected = selectedMixtures.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[
          styles.mixtureItem, 
          isSelected && styles.selectedMixtureItem,
          { 
            backgroundColor: colors.card, 
            borderColor: isSelected ? colors.primary : colors.border 
          }
        ]} 
        onPress={() => toggleMixtureSelection(item.id)}
      >
        <View style={styles.mixtureInfo}>
          <View style={[styles.mixtureIconContainer, { backgroundColor: colors.background }]}>
            <Beaker size={16} color={colors.primary} />
          </View>
          <View style={styles.mixtureDetails}>
            <Text style={[styles.mixtureName, { color: colors.textDark }]} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={[styles.mixtureSpecs, { color: colors.textLight }]}>
              {(item.caloriesPer1000ml / 1000).toFixed(2)} {t('kcal')}/{t('ml')} • {(item.proteinPer1000ml / 1000).toFixed(2)} {t('g')}/{t('ml')}
            </Text>
            <View style={styles.tagsContainer}>
              {item.isDiabetic && (
                <View style={[styles.tagContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                  <Text style={[styles.tag, { color: colors.primary }]}>{t('forDiabetics')}</Text>
                </View>
              )}
              {item.isSemiElemental && (
                <View style={[styles.tagContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                  <Text style={[styles.tag, { color: colors.primary }]}>{t('semiElemental')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.checkboxContainer}>
          {isSelected ? (
            <View style={[styles.checkbox, styles.checkboxSelected, { borderColor: colors.primary, backgroundColor: colors.primary }]}>
              <Check size={16} color="white" />
            </View>
          ) : (
            <View style={[styles.checkbox, { borderColor: colors.border }]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.primary }]}>{t('availableMixtures')}</Text>
        <Text style={[styles.subtitle, { color: colors.textLight }]}>
          {t('selectMixturesForCalculation')} {patient.id}
        </Text>
        
        {/* Warning messages at the top */}
        {hasDiabeticWarning() && (
          <View style={[styles.warningContainer, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
            <AlertTriangle size={20} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.textDark }]}>
              {t('diabeticWarning')}
            </Text>
          </View>
        )}
        
        {hasSemiElementalWarning() && (
          <View style={[styles.warningContainer, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
            <AlertTriangle size={20} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.textDark }]}>
              {t('semiElementalWarning')}
            </Text>
          </View>
        )}
      </View>
      
      <FlatList
        data={mixtures}
        keyExtractor={(item) => item.id}
        renderItem={renderMixtureItem}
        contentContainerStyle={styles.listContent}
      />
      
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <ArrowLeft size={20} color={colors.primary} />
          <Text style={[styles.backButtonText, { color: colors.primary }]}>{t('back')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.calculateButton, 
            selectedMixtures.length === 0 && styles.disabledButton,
            { backgroundColor: selectedMixtures.length === 0 ? colors.border : colors.primary }
          ]} 
          onPress={handleCalculate}
          disabled={selectedMixtures.length === 0}
        >
          <Text style={styles.calculateButtonText}>{t('calculateVolume')}</Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  mixtureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 9, // Changed from 6px to 9px to match mixtures screen
    borderWidth: 1,
    height: 75, // Changed from 80px to 75px to match mixtures screen
  },
  selectedMixtureItem: {
    borderColor: '#9370DB',
    backgroundColor: '#9370DB10',
  },
  mixtureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  mixtureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  mixtureDetails: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 2,
  },
  mixtureName: {
    fontSize: 16,
    fontWeight: '500',
  },
  mixtureSpecs: {
    fontSize: 12,
    marginVertical: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagContainer: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 0,
    marginRight: 4,
  },
  tag: {
    fontSize: 10,
  },
  checkboxContainer: {
    marginLeft: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderWidth: 0,
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
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  calculateButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});