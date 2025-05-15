import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { Moon, Sun, Globe, Lock, MessageCircle, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useThemeStore();
  const { language, setLanguage, t } = useLanguageStore();
  
  const isDarkMode = theme === 'dark';
  
  const handleLanguageSelect = (lang: 'ru' | 'en' | 'es' | 'fr' | 'zh' | 'de') => {
    setLanguage(lang);
    Alert.alert(t('language'), `${t('language')}: ${getLanguageName(lang)}`);
  };
  
  const handlePrivacyPress = () => {
    Alert.alert(
      t('privacy'),
      t('privacyText'),
      [{ text: 'OK' }]
    );
  };
  
  const handleContactPress = () => {
    Alert.alert(
      t('contactDeveloper'),
      t('telegramContact'),
      [{ text: 'OK' }]
    );
  };
  
  const getLanguageName = (code: string) => {
    switch (code) {
      case 'ru': return 'Русский';
      case 'en': return 'English';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      case 'zh': return '中文';
      case 'de': return 'Deutsch';
      default: return code;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('appearance')}</Text>
        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLabelContainer}>
            {isDarkMode ? (
              <Moon size={24} color={colors.primary} />
            ) : (
              <Sun size={24} color={colors.primary} />
            )}
            <Text style={[styles.settingLabel, { color: colors.textDark }]}>{t('darkTheme')}</Text>
          </View>
          <Switch
            trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
            thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
            onValueChange={toggleTheme}
            value={isDarkMode}
          />
        </View>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('language')}</Text>
        <TouchableOpacity 
          style={[
            styles.languageItem, 
            language === 'ru' && styles.selectedLanguage,
            { 
              borderBottomColor: colors.border,
              backgroundColor: language === 'ru' ? colors.primaryLight + '20' : colors.card 
            }
          ]} 
          onPress={() => handleLanguageSelect('ru')}
        >
          <View style={styles.languageInfo}>
            <Globe size={24} color={colors.primary} />
            <Text style={[styles.languageName, { color: colors.textDark }]}>Русский</Text>
          </View>
          {language === 'ru' && <Text style={[styles.selectedText, { color: colors.primary }]}>✓</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.languageItem, 
            language === 'en' && styles.selectedLanguage,
            { 
              borderBottomColor: colors.border,
              backgroundColor: language === 'en' ? colors.primaryLight + '20' : colors.card 
            }
          ]} 
          onPress={() => handleLanguageSelect('en')}
        >
          <View style={styles.languageInfo}>
            <Globe size={24} color={colors.primary} />
            <Text style={[styles.languageName, { color: colors.textDark }]}>English</Text>
          </View>
          {language === 'en' && <Text style={[styles.selectedText, { color: colors.primary }]}>✓</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.languageItem, 
            language === 'de' && styles.selectedLanguage,
            { 
              borderBottomColor: colors.border,
              backgroundColor: language === 'de' ? colors.primaryLight + '20' : colors.card 
            }
          ]} 
          onPress={() => handleLanguageSelect('de')}
        >
          <View style={styles.languageInfo}>
            <Globe size={24} color={colors.primary} />
            <Text style={[styles.languageName, { color: colors.textDark }]}>Deutsch</Text>
          </View>
          {language === 'de' && <Text style={[styles.selectedText, { color: colors.primary }]}>✓</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.languageItem, 
            language === 'es' && styles.selectedLanguage,
            { 
              borderBottomColor: colors.border,
              backgroundColor: language === 'es' ? colors.primaryLight + '20' : colors.card 
            }
          ]} 
          onPress={() => handleLanguageSelect('es')}
        >
          <View style={styles.languageInfo}>
            <Globe size={24} color={colors.primary} />
            <Text style={[styles.languageName, { color: colors.textDark }]}>Español</Text>
          </View>
          {language === 'es' && <Text style={[styles.selectedText, { color: colors.primary }]}>✓</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.languageItem, 
            language === 'fr' && styles.selectedLanguage,
            { 
              borderBottomColor: colors.border,
              backgroundColor: language === 'fr' ? colors.primaryLight + '20' : colors.card 
            }
          ]} 
          onPress={() => handleLanguageSelect('fr')}
        >
          <View style={styles.languageInfo}>
            <Globe size={24} color={colors.primary} />
            <Text style={[styles.languageName, { color: colors.textDark }]}>Français</Text>
          </View>
          {language === 'fr' && <Text style={[styles.selectedText, { color: colors.primary }]}>✓</Text>}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.languageItem, 
            language === 'zh' && styles.selectedLanguage,
            { 
              borderBottomColor: colors.border,
              backgroundColor: language === 'zh' ? colors.primaryLight + '20' : colors.card 
            }
          ]} 
          onPress={() => handleLanguageSelect('zh')}
        >
          <View style={styles.languageInfo}>
            <Globe size={24} color={colors.primary} />
            <Text style={[styles.languageName, { color: colors.textDark }]}>中文</Text>
          </View>
          {language === 'zh' && <Text style={[styles.selectedText, { color: colors.primary }]}>✓</Text>}
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('privacy')}</Text>
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: colors.border }]} 
          onPress={handlePrivacyPress}
        >
          <View style={styles.settingLabelContainer}>
            <Lock size={24} color={colors.primary} />
            <Text style={[styles.settingLabel, { color: colors.textDark }]}>{t('privacy')}</Text>
          </View>
          <ChevronRight size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('aboutApp')}</Text>
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: colors.border }]} 
          onPress={handleContactPress}
        >
          <View style={styles.settingLabelContainer}>
            <MessageCircle size={24} color={colors.primary} />
            <Text style={[styles.settingLabel, { color: colors.textDark }]}>{t('contactDeveloper')}</Text>
          </View>
          <ChevronRight size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textLight }]}>NutrICU v1.0.0</Text>
        <Text style={[styles.footerText, { color: colors.textLight }]}>{t('byDeveloper')}</Text>
        <Text style={[styles.footerText, { color: colors.textLight }]}>{t('telegramContact')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectedLanguage: {
    // Style applied in component with dynamic colors
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageName: {
    fontSize: 16,
    marginLeft: 12,
  },
  selectedText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4,
  },
});