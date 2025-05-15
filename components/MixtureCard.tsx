import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Edit2, Trash2, Beaker } from 'lucide-react-native';
import { Mixture } from '@/types/mixture';
import { useMixtureStore } from '@/store/mixtureStore';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';

interface MixtureCardProps {
  mixture: Mixture;
  onEdit: () => void;
}

export const MixtureCard = ({ mixture, onEdit }: MixtureCardProps) => {
  const router = useRouter();
  const deleteMixture = useMixtureStore((state) => state.deleteMixture);
  const { colors } = useThemeStore();
  const { t } = useLanguageStore();

  const handlePress = () => {
    router.push(`/mixture/${mixture.id}`);
  };

  const handleDelete = () => {
    // Add confirmation dialog to prevent accidental deletion
    Alert.alert(
      t('delete') + ' ' + t('mixtures').toLowerCase(),
      `${t('delete')} "${mixture.name}"?`,
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          onPress: () => {
            // Delete only the specific mixture by ID
            deleteMixture(mixture.id);
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Calculate per 1ml values
  const caloriesPer1ml = (mixture.caloriesPer1000ml / 1000).toFixed(3);
  const proteinPer1ml = (mixture.proteinPer1000ml / 1000).toFixed(3);

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card,
          shadowColor: colors.text
        }
      ]} 
      onPress={handlePress}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
        <Beaker 
          size={24} 
          color={colors.primary} 
          strokeWidth={1.5} 
        />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.nameContainer}>
          <Text 
            style={[styles.name, { color: colors.textDark }]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {mixture.name}
          </Text>
        </View>
        <Text style={[styles.details, { color: colors.textLight }]}>
          {caloriesPer1ml} {t('kcal')}/{t('ml')} • {proteinPer1ml} {t('g')} {t('protein')}/{t('ml')}
        </Text>
        <View style={styles.tagsContainer}>
          {mixture.isDiabetic && (
            <View style={[styles.tagContainer, { backgroundColor: colors.primaryLight + '20' }]}>
              <Text style={[styles.tag, { color: colors.primary }]}>{t('forDiabetics')}</Text>
            </View>
          )}
          {mixture.isSemiElemental && (
            <View style={[styles.tagContainer, { backgroundColor: colors.primaryLight + '20' }]}>
              <Text style={[styles.tag, { color: colors.primary }]}>{t('semiElemental')}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.actionsContainer}>
        {/* Only show edit button if not a default mixture */}
        {!mixture.isDefault && (
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Edit2 size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 9, // Changed from 6 to 9
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 75, // Changed from 80 to 75
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16, // Changed from 18 to 16 to match MixtureSelection
    fontWeight: 'bold',
    marginRight: 4,
    flex: 1,
  },
  details: {
    fontSize: 12, // Changed from 14 to 12 to match MixtureSelection
    marginVertical: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagContainer: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    marginTop: 2,
  },
  tag: {
    fontSize: 10, // Changed from 12 to 10 to match MixtureSelection
  },
  actionsContainer: {
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: 8,
    height: '100%',
  },
  actionButton: {
    padding: 8,
  },
});