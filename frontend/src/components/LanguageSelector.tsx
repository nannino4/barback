import React from 'react';
import { Languages, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/hooks/useI18n';
import { useLanguageStore } from '@/stores/languageStore';

const AVAILABLE_LANGUAGES = [
  { code: 'en' as const, label: 'English', nativeLabel: 'English', short: 'EN' },
  { code: 'it' as const, label: 'Italian', nativeLabel: 'Italiano', short: 'IT' },
] as const;

export const LanguageSelector: React.FC = () =>
{
  const { changeLanguage, currentLanguage, t } = useI18n();
  const { setLanguage } = useLanguageStore();

  const handleLanguageChange = (languageCode: 'en' | 'it') =>
  {
    setLanguage(languageCode);
    changeLanguage(languageCode);
  };

  const currentLang = AVAILABLE_LANGUAGES.find(
    (lang) => lang.code === currentLanguage,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          title={t('language.toggle')}
          className="gap-2"
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="text-sm font-medium">
            {currentLang?.short || 'EN'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {AVAILABLE_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between gap-4 cursor-pointer"
          >
            <span>{lang.nativeLabel}</span>
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
