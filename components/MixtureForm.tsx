import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mixture } from '@/types/mixture';
import { useMixtureStore } from '@/store/mixtureStore';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';

interface MixtureFormProps {
  initialData?: Mixture;
  isEditing?: boolean;
}

const defaultMixture: Mixture = {
  id: '',
  name: '',
  caloriesPer1000ml: 1000,
  proteinPer1000ml: 40,
  isDiabetic: false,
  isSemiElemental: false,
};

export const MixtureForm = ({ initialData, isEditing = false }: MixtureFormProps) => {
  const router = useRouter();
  const addMixture = useMixtureStore((state) => state.addMixture);
  const updateMixture = useMixtureStore((state) => state.updateMixture);
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();
  
  const [formData, setFormData] = useState<Mixture>(
    initialData || {...defaultMixture}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof Mixture, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (field: keyof Mixture, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    handleChange(field, numValue);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('mixtureName') + ' ' + t('required');
    }
    
    if (formData.caloriesPer1000ml <= 0) {
      newErrors.caloriesPer1000ml = t('caloriesPer1000ml') + ' ' + t('mustBePositive');
    }
    
    if (formData.proteinPer1000ml <= 0) {
      newErrors.proteinPer1000ml = t('proteinPer1000ml') + ' ' + t('mustBePositive');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }
    
    if (isEditing) {
      const error = updateMixture(formData);
      if (error) {
        Alert.alert(t('error'), error);
      } else {
        router.push(`/mixture/${formData.id}`);
      }
    } else {
      const error = addMixture(formData);
      if (error) {
        Alert.alert(t('error'), error);
      } else {
        router.push('/mixtures');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.primary }]}>
            {isEditing ? t('mixtureEditing') : t('addNewMixture')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('mixtureName')}</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, borderColor: errors.name ? colors.error : colors.border, color: colors.textDark },
                errors.name && styles.inputError
              ]}
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholder={t('mixtureName')}
              placeholderTextColor={colors.textLight}
            />
            {errors.name && <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('caloriesPer1000ml')}</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, borderColor: errors.caloriesPer1000ml ? colors.error : colors.border, color: colors.textDark },
                errors.caloriesPer1000ml && styles.inputError
              ]}
              value={formData.caloriesPer1000ml.toString()}
              onChangeText={(value) => handleNumberChange('caloriesPer1000ml', value)}
              keyboardType="numeric"
              placeholder={t('caloriesPer1000ml')}
              placeholderTextColor={colors.textLight}
            />
            {errors.caloriesPer1000ml && <Text style={[styles.errorText, { color: colors.error }]}>{errors.caloriesPer1000ml}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('proteinPer1000ml')}</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, borderColor: errors.proteinPer1000ml ? colors.error : colors.border, color: colors.textDark },
                errors.proteinPer1000ml && styles.inputError
              ]}
              value={formData.proteinPer1000ml.toString()}
              onChangeText={(value) => handleNumberChange('proteinPer1000ml', value)}
              keyboardType="numeric"
              placeholder={t('proteinPer1000ml')}
              placeholderTextColor={colors.textLight}
            />
            {errors.proteinPer1000ml && <Text style={[styles.errorText, { color: colors.error }]}>{errors.proteinPer1000ml}</Text>}
          </View>
          
          <View style={styles.switchGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('forDiabetics')}</Text>
            <Switch
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={formData.isDiabetic ? colors.primary : '#f4f3f4'}
              onValueChange={(value) => handleChange('isDiabetic', value)}
              value={formData.isDiabetic}
            />
          </View>
          
          <View style={styles.switchGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('semiElemental')}</Text>
            <Switch
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={formData.isSemiElemental ? colors.primary : '#f4f3f4'}
              onValueChange={(value) => handleChange('isSemiElemental', value)}
              value={formData.isSemiElemental}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, { backgroundColor: colors.primaryDark }]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>
                {isEditing ? t('save') : t('addNewMixture')}
              </Text>
            </TouchableOpacity>
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
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6A1B9A',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});