import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/stores/languageStore';
import type { SupportedLanguage } from '@/constants/i18n';

/**
 * Type-safe i18n hook
 * 
 * Returns a fully typed translation function with autocomplete support.
 * 
 * Usage:
 * ```tsx
 * const { t } = useI18n();
 * 
 * // ✅ Autocomplete suggests all available keys
 * t('auth.login.success')
 * 
 * // ✅ TypeScript error for invalid keys
 * t('auth.invalid.key')  // Error!
 * 
 * // ✅ Type-safe interpolation
 * t('auth.forgotPassword.cooldown', { seconds: 30 })
 * ```
 */
export const useI18n = () =>
{
  const { t, i18n } = useTranslation();
  const { setLanguage } = useLanguageStore();
    
  const changeLanguage = (language: SupportedLanguage) =>
  {
    setLanguage(language);
    void i18n.changeLanguage(language);
  };
    
  const currentLanguage = i18n.language || 'en';
    
  return {
    // t is now fully typed thanks to our i18next.d.ts declaration
    t,
    changeLanguage,
    currentLanguage,
    isReady: i18n.isInitialized,
  };
};