import { useState } from 'react';
import { LogOut, Settings, ChevronRight, Building2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { Stack, Divider } from '../layout';
import { Icon } from '@/components/ui/icon';
import { ROUTES } from '@/constants/routes';

/**
 * UserMenuMobile - Mobile sheet menu implementation
 * 
 * Updated IA (Sprint 4.5):
 * - User profile link
 * - My Venues link (with invitations badge)
 * - Organization Settings (role-gated: owner/manager only)
 * - Preferences (theme + language)
 * - Logout
 * 
 * Organization switching is now handled by OrganizationSwitcherPopover in TopNav
 * (on larger screens) or through the My Venues page on mobile.
 */
export const UserMenuMobile: React.FC = () =>
{
  const { user, logout } = useAuth();
  const { t, changeLanguage, currentLanguage } = useI18n();
  const { currentOrg } = useOrganizations();
  const { theme, setTheme } = useThemeStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'main' | 'preferences'>('main');

  if (!user) return null;

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

  // Check if user can access org settings (owner or manager)
  const canAccessOrgSettings = currentOrg && 
    (currentOrg.role === 'OWNER' || currentOrg.role === 'MANAGER');

  const sheetTitle =
    mobileView === 'main'
      ? t('menu.userMenu')
      : t('menu.preferences');

  const sheetDescription =
    mobileView === 'main'
      ? t('menu.userMenuDescription')
      : t('menu.preferencesDescription');

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 relative"
            aria-label={t('menu.openUserMenu')}
          >
            <UserAvatar user={user} size="md" />
            <InvitationsBadge
              display="dot"
              className="absolute right-1 top-1"
            />
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
              <Button
                variant="ghost"
                size="lg"
                asChild
                className={cn(
                  'w-full justify-start rounded-lg h-auto py-3 px-4',
                  'text-left hover:bg-muted',
                )}
                aria-label={t('menu.viewAccount')}
              >
                <Link
                  to={ROUTES.USERS.ME}
                  onClick={() =>
                  {
                    setSheetOpen(false);
                    setMobileView('main');
                  }}
                >
                  <UserInfo user={user} size="md" className="flex-1 min-w-0" />
                </Link>
              </Button>

              <Divider />

              {/* My Venues - direct link */}
              <Button
                variant="ghost"
                size="lg"
                asChild
                className={cn(
                  'w-full justify-start rounded-lg h-auto py-3 px-4',
                  'text-left hover:bg-muted',
                )}
              >
                <Link
                  to={ROUTES.ORGS.ROOT}
                  onClick={() =>
                  {
                    setSheetOpen(false);
                    setMobileView('main');
                  }}
                >
                  <Icon mode="inline" size="md">
                    <Building2 />
                  </Icon>
                  <span className="flex-1 font-medium">{t('menu.myVenues')}</span>
                  <InvitationsBadge />
                </Link>
              </Button>

              {/* Organization Settings - Role-gated (owner/manager only) */}
              {canAccessOrgSettings && (
                <Button
                  variant="ghost"
                  size="lg"
                  asChild
                  className={cn(
                    'w-full justify-start rounded-lg h-auto py-3 px-4',
                    'text-left hover:bg-muted',
                  )}
                >
                  <Link
                    to={ROUTES.ORGS.DETAIL.replace(':orgId', currentOrg.org.id)}
                    onClick={() =>
                    {
                      setSheetOpen(false);
                      setMobileView('main');
                    }}
                  >
                    <Icon mode="inline" size="md">
                      <Settings />
                    </Icon>
                    <span className="flex-1 font-medium">{t('nav.orgSettings')}</span>
                    <Icon mode="inline" size="md" variant="muted">
                      <ChevronRight />
                    </Icon>
                  </Link>
                </Button>
              )}

              {/* Preferences */}
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setMobileView('preferences')}
                className={cn(
                  'w-full justify-start rounded-lg h-auto py-3 px-4',
                  'text-left hover:bg-muted',
                )}
                aria-label={t('menu.openPreferences')}
              >
                <Icon mode="inline" size="md">
                  <User />
                </Icon>
                <span className="flex-1 font-medium">{t('menu.preferences')}</span>
                <Icon mode="inline" size="md" variant="muted">
                  <ChevronRight />
                </Icon>
              </Button>

              <Divider />

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="lg"
                onClick={handleLogout}
                className={cn(
                  'w-full justify-start rounded-lg h-auto py-3 px-4',
                  'text-left text-destructive hover:bg-destructive/10 hover:text-destructive',
                )}
              >
                <Icon mode="inline" size="md" variant="destructive">
                  <LogOut />
                </Icon>
                <span className="flex-1 font-medium">{t('nav.logout')}</span>
              </Button>
            </Stack>
          )}

          {/* Preferences View */}
          {mobileView === 'preferences' && (
            <Stack direction="vertical" space="lg" className="pt-16">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileView('main')}
                className="absolute left-4 top-4 min-h-touch min-w-touch justify-start gap-2 text-muted-foreground hover:text-foreground"
              >
                <Icon mode="inline" size="sm" variant="muted" className="rotate-180">
                  <ChevronRight />
                </Icon>
                <span>{t('common.back')}</span>
              </Button>

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
    </>
  );
};
