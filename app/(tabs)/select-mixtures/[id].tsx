import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { usePatientStore } from '@/store/patientStore';
import { MixtureSelection } from '@/components/MixtureSelection';

export default function SelectMixturesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getPatient = usePatientStore((state) => state.getPatient);
  
  const patient = getPatient(id);
  
  if (!patient) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <MixtureSelection patient={patient} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});