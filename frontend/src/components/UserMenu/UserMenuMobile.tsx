import { useState } from 'react';
import { LogOut, User as UserIcon, Settings, ChevronRight, Building2 } from 'lucide-react';
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
import { UserAvatar, UserInfo } from '@/components/user';
import { InvitationsBadge } from '@/components/features/invitations/InvitationsBadge';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';
import { OrganizationSwitcherSheet } from './OrganizationSwitcherSheet';
import { Stack, Divider } from '../layout';

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
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);

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

  const handleOpenOrgSwitcher = () =>
  {
    setSheetOpen(false);
    setOrgSwitcherOpen(true);
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            aria-label={t('menu.openUserMenu')}
          >
            <UserAvatar user={user} size="md" />
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
              <UserInfo user={user} size="md" />

              <Divider />

              {/* Current Organization - Opens Org Switcher */}
              <button
                type="button"
                onClick={handleOpenOrgSwitcher}
                className="w-full py-4 hover:bg-muted/50 transition-colors"
                aria-label={t('menu.switchVenue')}
              >
                <Stack direction="horizontal" space="sm" align="center" className="px-2 py-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <Stack space="xs" className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-muted-foreground">
                      {t('menu.currentVenue')}
                    </p>
                    <p className="text-sm font-medium truncate">
                      {currentOrg?.org.name ?? t('organizations.selectVenue')}
                    </p>
                  </Stack>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Stack>
              </button>

              {/* My Venues - direct link */}
              <button
                type="button"
                onClick={() => handleNavigate('/orgs')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
                  "hover:bg-muted transition-colors text-left",
                )}
              >
                <Building2 className="h-5 w-5" />
                <span className="flex-1 font-medium">{t('menu.myVenues')}</span>
                <InvitationsBadge />
              </button>

              <Divider />

              {/* Menu Items */}
              <Stack space="xs" className="flex-1 py-4">
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
              </Stack>

              <Divider />

              {/* Logout Button */}
              <Stack className="pt-4">
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
              </Stack>
            </Stack>
          )}

          {/* Preferences View */}
          {mobileView === 'preferences' && (
            <Stack direction="vertical" space="lg" className="pt-16">
              {/* Back Button */}
              <button
                type="button"
                onClick={() => setMobileView('main')}
                className="absolute left-4 top-4 min-h-touch min-w-touch flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>{t('common.back')}</span>
              </button>

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
            </Stack>
          )}
        </SheetContent>
      </Sheet>

      {/* Organization Switcher Sheet */}
      <OrganizationSwitcherSheet
        open={orgSwitcherOpen}
        onOpenChange={setOrgSwitcherOpen}
      />
    </>
  );
};
