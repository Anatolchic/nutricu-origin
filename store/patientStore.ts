import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient } from '@/types/patient';
import { processPatientData } from '@/utils/calculations';
import { useLanguageStore } from './languageStore';

interface PatientState {
  patients: Patient[];
  addPatient: (patient: Patient) => string | null;
  updatePatient: (patient: Patient) => void;
  deletePatient: (id: string) => void;
  getPatient: (id: string) => Patient | undefined;
  patientExists: (id: string) => boolean;
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: [],
      
      addPatient: (patient: Patient) => {
        // Check if patient with this ID already exists
        if (get().patientExists(patient.id)) {
          const { t } = useLanguageStore.getState();
          return t('patientIdExists');
        }
        
        const processedPatient = processPatientData({
          ...patient,
          createdAt: Date.now() // Add timestamp when patient is created
        });
        
        set((state) => ({
          patients: [...state.patients, processedPatient],
        }));
        return null;
      },
      
      updatePatient: (patient: Patient) => {
        const processedPatient = processPatientData(patient);
        set((state) => ({
          patients: state.patients.map((p) => 
            p.id === patient.id ? processedPatient : p
          ),
        }));
      },
      
      deletePatient: (id: string) => {
        set((state) => ({
          patients: state.patients.filter((p) => p.id !== id),
        }));
      },
      
      getPatient: (id: string) => {
        return get().patients.find((p) => p.id === id);
      },
      
      patientExists: (id: string) => {
        return get().patients.some((p) => p.id === id);
      },
    }),
    {
      name: 'nutrICU-patients',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);