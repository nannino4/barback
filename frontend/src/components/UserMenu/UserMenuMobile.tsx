import { useState } from 'react';
import { LogOut, User as UserIcon, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';
import { UserInfo } from './UserInfo';
import { OrganizationMenuItem } from './OrganizationMenuItem';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';
import { Stack } from '../layout';

/**
 * UserMenuMobile - Mobile sheet menu implementation
 * 
 * Full-screen slide-out sheet with main menu and preferences views.
 */
export const UserMenuMobile: React.FC = () =>
{
  const { user, logout } = useAuth();
  const { t, changeLanguage, currentLanguage } = useI18n();
  const navigate = useNavigate();
  const { currentOrg } = useOrganizations();
  const { theme, setTheme } = useThemeStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'main' | 'preferences'>('main');

  if (!user) return null;

  const handleNavigate = (path: string) =>
  {
    setSheetOpen(false);
    void navigate(path);
  };

  const handleLogout = () =>
  {
    setSheetOpen(false);
    logout();
  };

  const handleSheetOpenChange = (open: boolean) =>
  {
    setSheetOpen(open);
    if (!open)
    {
      setMobileView('main');
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          aria-label={t('menu.openUserMenu')}
        >
          <UserAvatar user={user} size="sm" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="sr-only">
            {mobileView === 'main' ? t('menu.userMenu') : t('menu.preferences')}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {mobileView === 'main' 
              ? t('menu.userMenuDescription')
              : t('menu.preferencesDescription')
            }
          </SheetDescription>
        </SheetHeader>

        {/* Main Menu View */}
        {mobileView === 'main' && (
          <Stack direction="vertical" className="pt-6">
            {/* User Info Header */}
            <UserInfo user={user} variant="mobile" />

            {/* Current Organization */}
            <OrganizationMenuItem
              currentOrg={currentOrg}
              onClick={() => handleNavigate('/organizations')}
              variant="mobile"
            />

            {/* Menu Items */}
            <nav className="flex-1 py-4 space-y-1">
              {/* Account */}
              <button
                type="button"
                onClick={() => handleNavigate('/account')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                  "hover:bg-muted transition-colors text-left",
                )}
                aria-label={t('menu.viewAccount')}
              >
                <UserIcon className="h-5 w-5" />
                <span className="flex-1 font-medium">{t('menu.account')}</span>
              </button>

              {/* Preferences */}
              <button
                type="button"
                onClick={() => setMobileView('preferences')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                  "hover:bg-muted transition-colors text-left",
                )}
                aria-label={t('menu.openPreferences')}
              >
                <Settings className="h-5 w-5" />
                <span className="flex-1 font-medium">{t('menu.preferences')}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </nav>

            {/* Logout Button */}
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                  "hover:bg-destructive/10 transition-colors text-left",
                  "text-destructive",
                )}
              >
                <LogOut className="h-5 w-5" />
                <span className="flex-1 font-medium">{t('nav.logout')}</span>
              </button>
            </div>
          </Stack>
        )}

        {/* Preferences View */}
        {mobileView === 'preferences' && (
          <Stack direction="vertical" className="pt-16">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setMobileView('main')}
              className="absolute left-4 top-4 min-h-touch min-w-touch flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span>{t('common.back')}</span>
            </button>

            <div className="space-y-6">
              {/* Theme Selection */}
              <ThemeSelector
                currentTheme={theme}
                onThemeChange={setTheme}
                variant="mobile"
              />

              {/* Language Selection */}
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={changeLanguage}
                variant="mobile"
              />
            </div>
          </Stack>
        )}
      </SheetContent>
    </Sheet>
  );
};
