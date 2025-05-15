import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { useMixtureStore } from '@/store/mixtureStore';
import { MixtureDetails } from '@/components/MixtureDetails';

export default function MixtureDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getMixture = useMixtureStore((state) => state.getMixture);
  
  const mixture = getMixture(id);
  
  if (!mixture) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <MixtureDetails mixture={mixture} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});