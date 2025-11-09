import { Check, Monitor, Sun, Moon } from 'lucide-react';
import { DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  currentTheme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  variant: 'dropdown' | 'mobile';
}

/**
 * ThemeSelector - Theme selection UI (Light/Dark/System)
 * 
 * Desktop: Compact dropdown menu items
 * Mobile: Larger touch-friendly buttons
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  currentTheme, 
  onThemeChange,
  variant,
}) =>
{
  const { t } = useI18n();

  const themes = [
    { value: 'light' as const, icon: Sun, label: t('preferences.theme.light') },
    { value: 'dark' as const, icon: Moon, label: t('preferences.theme.dark') },
    { value: 'system' as const, icon: Monitor, label: t('preferences.theme.system') },
  ];

  if (variant === 'dropdown')
  {
    return (
      <>
        <DropdownMenuLabel>{t('preferences.theme.title')}</DropdownMenuLabel>
        {themes.map(({ value, icon: Icon, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onThemeChange(value)}
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </div>
            {currentTheme === value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </>
    );
  }

  // Mobile variant
  return (
    <div className="space-y-4 px-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        {t('preferences.theme.title')}
      </h3>
      <div className="space-y-2">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onThemeChange(value)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
              "hover:bg-muted transition-colors",
              currentTheme === value && "bg-muted",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="flex-1 text-left">{label}</span>
            {currentTheme === value && <Check className="h-5 w-5 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
};
