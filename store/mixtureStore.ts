import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mixture } from '@/types/mixture';

// Default mixtures that can now be edited or deleted
const defaultMixtures: Mixture[] = [
  {
    id: '1',
    name: 'Фрезубин интенсив',
    caloriesPer1000ml: 1220,
    proteinPer1000ml: 100,
    isDiabetic: false,
    isSemiElemental: true,
    isDefault: true
  },
  {
    id: '2',
    name: 'Фрезубин ВП 2 ккал',
    caloriesPer1000ml: 2000,
    proteinPer1000ml: 100,
    isDiabetic: false,
    isSemiElemental: false,
    isDefault: true
  },
  {
    id: '3',
    name: 'Фрезубин сипинг 2 ккал',
    caloriesPer1000ml: 2000,
    proteinPer1000ml: 100,
    isDiabetic: false,
    isSemiElemental: false,
    isDefault: true
  },
  {
    id: '4',
    name: 'Фрезубин крем 2 ккал',
    caloriesPer1000ml: 2000,
    proteinPer1000ml: 100,
    isDiabetic: false,
    isSemiElemental: false,
    isDefault: true
  },
  {
    id: '5',
    name: 'Пептамен интенс',
    caloriesPer1000ml: 1000,
    proteinPer1000ml: 93,
    isDiabetic: false,
    isSemiElemental: true,
    isDefault: true
  },
  {
    id: '6',
    name: 'Пептамен АФ',
    caloriesPer1000ml: 1520,
    proteinPer1000ml: 94,
    isDiabetic: false,
    isSemiElemental: true,
    isDefault: true
  },
  {
    id: '7',
    name: 'Ресурс диабет плюс (сипинг)',
    caloriesPer1000ml: 1600,
    proteinPer1000ml: 90,
    isDiabetic: true,
    isSemiElemental: false,
    isDefault: true
  },
  {
    id: '8',
    name: 'Ресурс протеин (сипинг)',
    caloriesPer1000ml: 1250,
    proteinPer1000ml: 94,
    isDiabetic: false,
    isSemiElemental: false,
    isDefault: true
  },
  {
    id: '9',
    name: 'Ресурс 2,0',
    caloriesPer1000ml: 2000,
    proteinPer1000ml: 90,
    isDiabetic: false,
    isSemiElemental: false,
    isDefault: true
  },
  {
    id: '10',
    name: 'Новасурс диабет плюс',
    caloriesPer1000ml: 1230,
    proteinPer1000ml: 59.2,
    isDiabetic: true,
    isSemiElemental: false,
    isDefault: true
  },
  {
    id: '11',
    name: 'Нутризон Эдванст Диазон',
    caloriesPer1000ml: 1030,
    proteinPer1000ml: 43,
    isDiabetic: true,
    isSemiElemental: false,
    isDefault: true
  },
  {
    id: '12',
    name: 'Нутризон Диазон НЕНР',
    caloriesPer1000ml: 1500,
    proteinPer1000ml: 77,
    isDiabetic: true,
    isSemiElemental: false,
    isDefault: true
  }
];

interface MixtureState {
  mixtures: Mixture[];
  addMixture: (mixture: Mixture) => string | null;
  updateMixture: (mixture: Mixture) => string | null;
  deleteMixture: (id: string) => void;
  getMixture: (id: string) => Mixture | undefined;
  mixtureExists: (id: string) => boolean;
  mixtureNameExists: (name: string, excludeId?: string) => boolean;
  getNextId: () => string;
  initializeDefaultMixtures: () => void;
}

export const useMixtureStore = create<MixtureState>()(
  persist(
    (set, get) => ({
      mixtures: [],
      
      addMixture: (mixture: Mixture) => {
        // Check if mixture name already exists
        if (get().mixtureNameExists(mixture.name)) {
          return 'Смесь с таким названием уже существует';
        }
        
        // Assign next sequential ID
        const nextId = get().getNextId();
        const mixtureWithId = { ...mixture, id: nextId };
        
        set((state) => ({
          mixtures: [...state.mixtures, mixtureWithId],
        }));
        return null;
      },
      
      updateMixture: (mixture: Mixture) => {
        // Check if mixture name already exists (excluding the current mixture)
        if (get().mixtureNameExists(mixture.name, mixture.id)) {
          return 'Смесь с таким названием уже существует';
        }
        
        set((state) => ({
          mixtures: state.mixtures.map((m) => 
            m.id === mixture.id ? mixture : m
          ),
        }));
        return null;
      },
      
      deleteMixture: (id: string) => {
        // Allow deleting any mixture, including default ones
        set((state) => ({
          mixtures: state.mixtures.filter((m) => m.id !== id),
        }));
      },
      
      getMixture: (id: string) => {
        return get().mixtures.find((m) => m.id === id);
      },
      
      mixtureExists: (id: string) => {
        return get().mixtures.some((m) => m.id === id);
      },
      
      mixtureNameExists: (name: string, excludeId?: string) => {
        return get().mixtures.some((m) => 
          m.name.toLowerCase() === name.toLowerCase() && m.id !== excludeId
        );
      },
      
      getNextId: () => {
        const mixtures = get().mixtures;
        
        if (mixtures.length === 0) {
          return '13'; // Start with 13 since we have default mixtures with IDs 1-12
        }
        
        // Find the maximum ID
        const maxId = Math.max(...mixtures.map(m => parseInt(m.id)));
        
        // Return the next ID (max + 1)
        return (maxId + 1).toString();
      },
      
      initializeDefaultMixtures: () => {
        set((state) => {
          // Check if default mixtures already exist
          const existingDefaultIds = new Set(
            state.mixtures
              .filter(m => m.isDefault)
              .map(m => m.id)
          );
          
          // Only add default mixtures that don't already exist
          const missingDefaults = defaultMixtures.filter(
            dm => !existingDefaultIds.has(dm.id)
          );
          
          if (missingDefaults.length === 0) {
            return state; // No changes needed
          }
          
          return {
            mixtures: [...state.mixtures, ...missingDefaults]
          };
        });
      }
    }),
    {
      name: 'nutrICU-mixtures',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Initialize default mixtures after rehydration
        if (state) {
          state.initializeDefaultMixtures();
        }
      }
    }
  )
);