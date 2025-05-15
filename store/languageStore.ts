import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, TranslationKey, translations } from '@/i18n/translations';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'ru',
      
      setLanguage: (language: Language) => {
        set({ language });
      },
      
      t: (key: TranslationKey) => {
        const lang = get().language;
        return translations[lang][key] || key;
      }
    }),
    {
      name: 'nutrICU-language',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);