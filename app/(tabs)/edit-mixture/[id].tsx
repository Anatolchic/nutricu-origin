import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { useMixtureStore } from '@/store/mixtureStore';
import { MixtureForm } from '@/components/MixtureForm';

export default function EditMixtureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getMixture = useMixtureStore((state) => state.getMixture);
  
  const mixture = getMixture(id);
  
  if (!mixture) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <MixtureForm initialData={mixture} isEditing={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});