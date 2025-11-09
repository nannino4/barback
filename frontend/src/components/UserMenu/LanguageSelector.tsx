import { Check } from 'lucide-react';
import { DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (lang: 'en' | 'it') => void;
  variant: 'dropdown' | 'mobile';
}

/**
 * LanguageSelector - Language selection UI (EN/IT)
 * 
 * Desktop: Compact dropdown menu items
 * Mobile: Larger touch-friendly buttons
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  currentLanguage, 
  onLanguageChange,
  variant,
}) =>
{
  const { t } = useI18n();

  const languages = [
    { value: 'en' as const, label: t('preferences.language.english') },
    { value: 'it' as const, label: t('preferences.language.italian') },
  ];

  if (variant === 'dropdown')
  {
    return (
      <>
        <DropdownMenuLabel>{t('preferences.language.title')}</DropdownMenuLabel>
        {languages.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onLanguageChange(value)}
            className="cursor-pointer flex items-center justify-between"
          >
            <span>{label}</span>
            {currentLanguage === value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </>
    );
  }

  // Mobile variant
  return (
    <div className="space-y-4 px-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        {t('preferences.language.title')}
      </h3>
      <div className="space-y-2">
        {languages.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onLanguageChange(value)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
              "hover:bg-muted transition-colors",
              currentLanguage === value && "bg-muted",
            )}
          >
            <span className="flex-1 text-left">{label}</span>
            {currentLanguage === value && <Check className="h-5 w-5 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
};
