import { useLanguageStore } from '@/store/languageStore';

export const formatDate = (timestamp: number): string => {
  const { language } = useLanguageStore.getState();
  
  const date = new Date(timestamp);
  
  // Format based on language
  let options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  let locale: string;
  
  switch (language) {
    case 'ru':
      locale = 'ru-RU';
      break;
    case 'en':
      locale = 'en-US';
      break;
    case 'es':
      locale = 'es-ES';
      break;
    case 'fr':
      locale = 'fr-FR';
      break;
    case 'zh':
      locale = 'zh-CN';
      break;
    case 'de':
      locale = 'de-DE';
      break;
    default:
      locale = 'en-US';
  }
  
  return date.toLocaleString(locale, options);
};