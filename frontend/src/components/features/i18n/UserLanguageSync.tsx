import { useEffect } from 'react';

import i18n from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';

/**
 * Syncs app language from authenticated user preference.
 *
 * Keeps language concerns outside auth store while ensuring
 * user.language remains the source of truth after login/rehydration.
 */
export function UserLanguageSync()
{
  const userLanguage = useAuthStore((state) => state.user?.language);
  const currentStoreLanguage = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  useEffect(() =>
  {
    if (!userLanguage)
    {
      return;
    }

    if (currentStoreLanguage !== userLanguage)
    {
      setLanguage(userLanguage);
    }

    const normalizedI18nLanguage = (i18n.resolvedLanguage ?? i18n.language ?? '').toLowerCase();
    if (!normalizedI18nLanguage.startsWith(userLanguage))
    {
      void i18n.changeLanguage(userLanguage);
    }
  }, [currentStoreLanguage, setLanguage, userLanguage]);

  return null;
}
