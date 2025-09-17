import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from '@/locales/en/translation.json';
import itTranslations from '@/locales/it/translation.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  it: {
    translation: itTranslations,
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
        
    interpolation: {
      escapeValue: false, // React already escapes values
    },
        
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'barback-language',
    },
        
    // Default namespace
    defaultNS: 'translation',
    ns: 'translation',
        
    // React options
    react: {
      useSuspense: false,
    },
  });

export default i18n;