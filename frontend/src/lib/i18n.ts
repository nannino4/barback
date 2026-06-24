import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from '@/locales/en/translation.json';
import itTranslations from '@/locales/it/translation.json';
import { SUPPORTED_LANGUAGES } from '@/constants/i18n';

// Use 'as const' to enable stricter type inference
// This helps TypeScript understand the exact shape of our translations
const resources = {
  en: {
    translation: enTranslations,
  },
  it: {
    translation: itTranslations,
  },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    debug: process.env.NODE_ENV === 'development',
    supportedLngs: SUPPORTED_LANGUAGES,
        
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