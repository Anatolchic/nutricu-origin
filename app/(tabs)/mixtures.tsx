import React, { useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMixtureStore } from '@/store/mixtureStore';
import { MixtureCard } from '@/components/MixtureCard';
import { Plus } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';

export default function MixturesScreen() {
  const router = useRouter();
  const mixtures = useMixtureStore((state) => state.mixtures);
  const initializeDefaultMixtures = useMixtureStore((state) => state.initializeDefaultMixtures);
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();

  // Initialize default mixtures when the component mounts
  useEffect(() => {
    initializeDefaultMixtures();
  }, [initializeDefaultMixtures]);

  const handleAddMixture = () => {
    router.push('/add-mixture');
  };

  const handleEditMixture = (id: string) => {
    router.push(`/edit-mixture/${id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {mixtures.length > 0 ? (
        <FlatList
          data={mixtures}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MixtureCard 
              mixture={item} 
              onEdit={() => handleEditMixture(item.id)} 
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>{t('noMixtures')}</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]} 
            onPress={handleAddMixture}
          >
            <Plus size={24} color="white" />
            <Text style={styles.addButtonText}>{t('addNewMixture')}</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.floatingButton, { backgroundColor: colors.primary }]} 
        onPress={handleAddMixture}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for floating button
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});