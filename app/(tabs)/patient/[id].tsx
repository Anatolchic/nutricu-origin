import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { NutritionPlan } from '@/components/NutritionPlan';

export default function PatientDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getPatient = usePatientStore((state) => state.getPatient);
  
  const patient = getPatient(id);
  
  if (!patient) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <NutritionPlan patient={patient} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});