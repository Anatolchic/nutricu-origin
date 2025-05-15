import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { PatientForm } from '@/components/PatientForm';

export default function EditPatientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getPatient = usePatientStore((state) => state.getPatient);
  
  const patient = getPatient(id);
  
  if (!patient) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <PatientForm initialData={patient} isEditing={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});