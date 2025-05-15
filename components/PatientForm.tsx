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
import { Patient } from '@/types/patient';
import { usePatientStore } from '@/store/patientStore';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';

interface PatientFormProps {
  initialData?: Patient;
  isEditing?: boolean;
}

const defaultPatient: Patient = {
  id: '',
  gender: 'male',
  height: 170,
  weight: 70,
  age: 50,
  hasDiabetes: false,
  hasKidneyFailure: false,
  hasRefeedingRisk: false,
};

export const PatientForm = ({ initialData, isEditing = false }: PatientFormProps) => {
  const router = useRouter();
  const addPatient = usePatientStore((state) => state.addPatient);
  const updatePatient = usePatientStore((state) => state.updatePatient);
  const patientExists = usePatientStore((state) => state.patientExists);
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();
  
  const [formData, setFormData] = useState<Patient>(initialData || defaultPatient);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof Patient, value: any) => {
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

  const handleNumberChange = (field: keyof Patient, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    handleChange(field, numValue);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.id.trim()) {
      newErrors.id = t('id') + ' ' + t('patients').toLowerCase() + ' ' + t('required');
    }
    
    if (!isEditing && patientExists(formData.id)) {
      newErrors.id = t('patientIdExists');
    }
    
    if (formData.height <= 0) {
      newErrors.height = t('height') + ' ' + t('mustBePositive');
    }
    
    if (formData.weight <= 0) {
      newErrors.weight = t('weight') + ' ' + t('mustBePositive');
    }
    
    if (formData.age <= 0) {
      newErrors.age = t('age') + ' ' + t('mustBePositive');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }
    
    if (isEditing) {
      updatePatient(formData);
      router.push(`/patient/${formData.id}`);
    } else {
      const error = addPatient(formData);
      if (error) {
        Alert.alert(t('error'), error);
      } else {
        router.push(`/patient/${formData.id}`);
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
            {isEditing ? t('patientEditing') : t('addPatient')}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('id')} {t('patients').toLowerCase()}</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, borderColor: errors.id ? colors.error : colors.border, color: colors.textDark },
                errors.id && styles.inputError
              ]}
              value={formData.id}
              onChangeText={(value) => handleChange('id', value)}
              placeholder={t('id') + ' ' + t('patients').toLowerCase()}
              placeholderTextColor={colors.textLight}
              editable={!isEditing}
            />
            {errors.id && <Text style={[styles.errorText, { color: colors.error }]}>{errors.id}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('gender')}</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  { 
                    backgroundColor: formData.gender === 'male' ? colors.primary : colors.card,
                    borderColor: formData.gender === 'male' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleChange('gender', 'male')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    { color: formData.gender === 'male' ? 'white' : colors.textDark },
                  ]}
                >
                  {t('male')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  { 
                    backgroundColor: formData.gender === 'female' ? colors.primary : colors.card,
                    borderColor: formData.gender === 'female' ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleChange('gender', 'female')}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    { color: formData.gender === 'female' ? 'white' : colors.textDark },
                  ]}
                >
                  {t('female')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('age')} ({t('years')})</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, borderColor: errors.age ? colors.error : colors.border, color: colors.textDark },
                errors.age && styles.inputError
              ]}
              value={formData.age.toString()}
              onChangeText={(value) => handleNumberChange('age', value)}
              keyboardType="numeric"
              placeholder={t('age')}
              placeholderTextColor={colors.textLight}
            />
            {errors.age && <Text style={[styles.errorText, { color: colors.error }]}>{errors.age}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('height')} ({t('cm')})</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, borderColor: errors.height ? colors.error : colors.border, color: colors.textDark },
                errors.height && styles.inputError
              ]}
              value={formData.height.toString()}
              onChangeText={(value) => handleNumberChange('height', value)}
              keyboardType="numeric"
              placeholder={t('height')}
              placeholderTextColor={colors.textLight}
            />
            {errors.height && <Text style={[styles.errorText, { color: colors.error }]}>{errors.height}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('actualWeight')} ({t('kg')})</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.card, borderColor: errors.weight ? colors.error : colors.border, color: colors.textDark },
                errors.weight && styles.inputError
              ]}
              value={formData.weight.toString()}
              onChangeText={(value) => handleNumberChange('weight', value)}
              keyboardType="numeric"
              placeholder={t('weight')}
              placeholderTextColor={colors.textLight}
            />
            {errors.weight && <Text style={[styles.errorText, { color: colors.error }]}>{errors.weight}</Text>}
          </View>
          
          <View style={styles.switchGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('diabetes')}</Text>
            <Switch
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={formData.hasDiabetes ? colors.primary : '#f4f3f4'}
              onValueChange={(value) => handleChange('hasDiabetes', value)}
              value={formData.hasDiabetes}
            />
          </View>
          
          <View style={styles.switchGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('kidneyFailure')}</Text>
            <Switch
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={formData.hasKidneyFailure ? colors.primary : '#f4f3f4'}
              onValueChange={(value) => handleChange('hasKidneyFailure', value)}
              value={formData.hasKidneyFailure}
            />
          </View>
          
          <View style={styles.switchGroup}>
            <Text style={[styles.label, { color: colors.textDark }]}>{t('refeedingRisk')}</Text>
            <Switch
              trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
              thumbColor={formData.hasRefeedingRisk ? colors.primary : '#f4f3f4'}
              onValueChange={(value) => handleChange('hasRefeedingRisk', value)}
              value={formData.hasRefeedingRisk}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.calculateButton, { backgroundColor: colors.primaryDark }]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>{t('calculate')}</Text>
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
    fontSize: 14,
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderButtonText: {
    fontSize: 16,
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
  calculateButton: {
    backgroundColor: '#6A1B9A',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});