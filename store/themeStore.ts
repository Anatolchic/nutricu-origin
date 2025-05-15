import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '@/constants/colors';

type ThemeType = 'light' | 'dark';

interface ThemeState {
  theme: ThemeType;
  colors: typeof lightColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      colors: lightColors,
      
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
          colors: state.theme === 'light' ? darkColors : lightColors,
        }));
      },
      
      setTheme: (theme: ThemeType) => {
        set({ 
          theme,
          colors: theme === 'light' ? lightColors : darkColors,
        });
      },
    }),
    {
      name: 'nutrICU-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);