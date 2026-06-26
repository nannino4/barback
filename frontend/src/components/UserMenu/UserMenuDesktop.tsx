import { CreditCard, LogOut, Settings, Building2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useThemeStore } from '@/stores/themeStore';
import { UserAvatar, UserInfo } from '@/components/user';
import { InvitationsBadge } from '@/components/features/invitations/InvitationsBadge';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';
import { ROUTES } from '@/constants/routes';

/**
 * UserMenuDesktop - Desktop dropdown menu implementation
 * 
 * Updated IA (Sprint 4.5):
 * - User profile link
 * - My Venues link (with invitations badge)
 * - Organization Settings (role-gated: owner/manager only)
 * - Preferences submenu (theme + language)
 * - Logout
 * 
 * Organization switching is now handled by OrganizationSwitcherPopover in TopNav.
 */
export const UserMenuDesktop: React.FC = () =>
{
  const { user, logout } = useAuth();
  const { t, changeLanguage, currentLanguage } = useI18n();
  const { currentOrg } = useOrganizations();
  const { theme, setTheme } = useThemeStore();

  if (!user) return null;

  // Check if user can access org settings (owner or manager)
  const canAccessOrgSettings = currentOrg && 
    (currentOrg.role === 'OWNER' || currentOrg.role === 'MANAGER');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {/* User Info - navigates to profile */}
        <DropdownMenuItem asChild className="cursor-pointer" aria-label={t('menu.viewAccount')}>
          <Link to={ROUTES.USERS.ME}>
            <UserInfo user={user} size="md" className="w-full" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to={ROUTES.USERS.PAYMENT_METHODS}>
            <Icon mode="inline" size="sm" className="mr-2">
              <CreditCard />
            </Icon>
            <span>{t('payment.title')}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* My Venues - direct link */}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to={ROUTES.ORGS.ROOT}>
            <Icon mode="inline" size="sm" className="mr-2">
              <Building2 />
            </Icon>
            <span>{t('menu.myVenues')}</span>
            <InvitationsBadge className="ml-auto" />
          </Link>
        </DropdownMenuItem>

        {/* Organization Settings - Role-gated (owner/manager only) */}
        {canAccessOrgSettings && (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to={ROUTES.ORGS.detail(currentOrg.org.id)}>
              <Icon mode="inline" size="sm" className="mr-2">
                <Settings />
              </Icon>
              <span>{t('nav.orgSettings')}</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Preferences Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger aria-label={t('menu.openPreferences')}>
            <Icon mode="inline" size="sm" className="mr-2">
              <User />
            </Icon>
            <span>{t('menu.preferences')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            <ThemeSelector
              currentTheme={theme}
              onThemeChange={setTheme}
              variant="dropdown"
            />
            <DropdownMenuSeparator />
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={changeLanguage}
              variant="dropdown"
            />
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <Icon mode="inline" size="sm" variant="destructive" className="mr-2">
            <LogOut />
          </Icon>
          <span>{t('nav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
