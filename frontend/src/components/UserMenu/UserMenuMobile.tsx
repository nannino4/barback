import { useState } from 'react';
import { LogOut, Settings, ChevronRight, Building2, Check } from 'lucide-react';
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
import { OrgRoleBadge } from '@/components/features/organizations/OrgRoleBadge';
import { Card } from '@/components/ui/card';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';
import { Stack, Divider } from '../layout';
import { Icon } from '../ui/icon';

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
  const {
    currentOrg,
    organizations,
    switchOrganization,
    isLoading: isLoadingOrgs,
  } = useOrganizations();
  const { theme, setTheme } = useThemeStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'main' | 'preferences' | 'orgSwitch'>('main');

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

  const sortedOrganizations = [...organizations].sort((a, b) =>
  {
    if (a.org.id === currentOrg?.org.id) return -1;
    if (b.org.id === currentOrg?.org.id) return 1;
    return 0;
  });

  const handleSelectOrg = (orgMembership: typeof organizations[0]) =>
  {
    switchOrganization(orgMembership);
    setMobileView('main');
  };

  const sheetTitle =
    mobileView === 'main'
      ? t('menu.userMenu')
      : mobileView === 'preferences'
        ? t('menu.preferences')
        : t('menu.switchVenue');

  const sheetDescription =
    mobileView === 'main'
      ? t('menu.userMenuDescription')
      : mobileView === 'preferences'
        ? t('menu.preferencesDescription')
        : t('organizations.selectDescription');

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
              {sheetTitle}
            </SheetTitle>
            <SheetDescription className="sr-only">
              {sheetDescription}
            </SheetDescription>
          </SheetHeader>

          {/* Main Menu View */}
          {mobileView === 'main' && (
            <Stack direction="vertical" space='sm' className="pt-6">
              {/* User Info Header - navigates to profile */}
              <button
                type="button"
                onClick={() => handleNavigate('/account')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                  'hover:bg-muted transition-colors text-left',
                )}
                aria-label={t('menu.viewAccount')}
              >
                <UserInfo user={user} size="md" className="flex-1 min-w-0" />
              </button>

              <Divider />

              {/* Current Organization - Opens Org Switcher */}
              <button
                type="button"
                onClick={() => setMobileView('orgSwitch')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                  'hover:bg-muted transition-colors text-left',
                )}
                aria-label={t('menu.switchVenue')}
              >
                {currentOrg ? (
                  <Stack space="xs" className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-muted-foreground">
                      {t('menu.currentVenue')}
                    </p>
                    <p className="text-primary font-medium truncate">
                      {currentOrg.org.name}
                    </p>
                  </Stack>
                ) : (
                  <span className="flex-1 text-sm text-muted-foreground">
                    {t('menu.noVenueSelected')}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
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

              <Divider />

              {/* Logout Button */}
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

          {/* Organization Switch View */}
          {mobileView === 'orgSwitch' && (
            <div className="flex flex-col h-full pt-16">
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-4 min-h-touch min-w-touch flex text-muted-foreground hover:text-foreground"
                onClick={() => setMobileView('main')}
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>{t('common.back')}</span>
              </Button>

              <div className="flex-1 overflow-y-auto">
                {isLoadingOrgs ? (
                  <div className="space-y-2 px-4">
                    <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
                    <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
                    <div className="h-16 w-full rounded-lg bg-muted animate-pulse" />
                  </div>
                ) : organizations.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {t('organizations.noOrganizations')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 px-4">
                    {sortedOrganizations.map((orgMembership) =>
                    {
                      const isSelected = currentOrg?.org.id === orgMembership.org.id;
                      return (
                        <Card
                          key={orgMembership.org.id}
                          variant={isSelected ? 'highlighted' : 'default'}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectOrg(orgMembership)}
                          >
                            <Stack direction="horizontal" space="md" align="center">
                              {isSelected ? (
                                <Icon
                                  variant='primary'
                                  size='md'
                                >
                                  <Check/>
                                </Icon>
                              ) : (
                                <Icon
                                  variant='default'
                                  size='md'
                                >
                                  <Building2/>
                                </Icon>
                              )}
                              <Stack space="xs" className="flex-1 text-left min-w-0">
                                <span className="font-medium truncate">
                                  {orgMembership.org.name}
                                </span>
                                <OrgRoleBadge role={orgMembership.role} />
                              </Stack>
                            </Stack>
                          </button>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
