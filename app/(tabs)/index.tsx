import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { usePatientStore } from '@/store/patientStore';
import { PatientCard } from '@/components/PatientCard';
import { UserPlus } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';

export default function PatientsScreen() {
  const router = useRouter();
  const patients = usePatientStore((state) => state.patients);
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();

  // Sort patients by createdAt timestamp (newest first)
  const sortedPatients = [...patients].sort((a, b) => {
    const timeA = a.createdAt || 0;
    const timeB = b.createdAt || 0;
    return timeB - timeA; // Descending order (newest first)
  });

  const handleAddPatient = () => {
    router.push('/add');
  };

  const handleEditPatient = (id: string) => {
    router.push(`/edit/${id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {patients.length > 0 ? (
        <FlatList
          data={sortedPatients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PatientCard 
              patient={item} 
              onEdit={() => handleEditPatient(item.id)} 
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>{t('noPatients')}</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]} 
            onPress={handleAddPatient}
          >
            <UserPlus size={24} color="white" />
            <Text style={styles.addButtonText}>{t('addNewPatient')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
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
});