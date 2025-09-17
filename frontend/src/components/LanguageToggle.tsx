import React from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import { useLanguageStore } from '@/stores/languageStore';

export const LanguageToggle: React.FC = () =>
{
  const { changeLanguage, currentLanguage, t } = useI18n();
  const { setLanguage } = useLanguageStore();

  const handleLanguageChange = () =>
  {
    const newLanguage = currentLanguage === 'en' ? 'it' : 'en';
    setLanguage(newLanguage);
    changeLanguage(newLanguage);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLanguageChange}
      title={t('language.toggle')}
    >
      <Languages className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">{t('language.toggle')}</span>
    </Button>
  );
};