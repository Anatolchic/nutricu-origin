import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';
import { MixtureForm } from '@/components/MixtureForm';

export default function AddMixtureScreen() {
  return (
    <View style={styles.container}>
      <MixtureForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});