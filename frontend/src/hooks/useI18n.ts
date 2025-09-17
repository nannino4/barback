import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/stores/languageStore';

export const useI18n = () =>
{
  const { t, i18n } = useTranslation();
  const { setLanguage } = useLanguageStore();
    
  const changeLanguage = (language: string) =>
  {
    setLanguage(language as 'en' | 'it');
    void i18n.changeLanguage(language);
  };
    
  const currentLanguage = i18n.language || 'en';
    
  return {
    t,
    changeLanguage,
    currentLanguage,
    isReady: i18n.isInitialized,
  };
};