import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePathname } from 'expo-router';
import { colors } from '@/constants/colors';
import { PatientForm } from '@/components/PatientForm';
import { Patient } from '@/types/patient';

// Default patient with empty values
const defaultPatient: Patient = {
  id: '',
  gender: 'male',
  height: 0,
  weight: 0,
  age: 0,
  hasDiabetes: false,
  hasKidneyFailure: false,
  hasRefeedingRisk: false,
};

export default function AddPatientScreen() {
  const [formData, setFormData] = useState<Patient>(defaultPatient);
  const pathname = usePathname();
  
  // Reset form data when navigating to this screen
  useEffect(() => {
    if (pathname === '/add') {
      setFormData({...defaultPatient});
    }
  }, [pathname]);

  return (
    <View style={styles.container}>
      <PatientForm initialData={formData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});