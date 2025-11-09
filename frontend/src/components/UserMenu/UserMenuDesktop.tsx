import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useThemeStore } from '@/stores/themeStore';
import { UserAvatar } from './UserAvatar';
import { UserInfo } from './UserInfo';
import { OrganizationMenuItem } from './OrganizationMenuItem';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';

/**
 * UserMenuDesktop - Desktop dropdown menu implementation
 * 
 * Compact dropdown menu with user info, organization, account, preferences submenu, and logout.
 */
export const UserMenuDesktop: React.FC = () =>
{
  const { user, logout } = useAuth();
  const { t, changeLanguage, currentLanguage } = useI18n();
  const navigate = useNavigate();
  const { currentOrg } = useOrganizations();
  const { theme, setTheme } = useThemeStore();

  if (!user) return null;

  const handleNavigate = (path: string) =>
  {
    void navigate(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          aria-label={t('menu.openUserMenu')}
        >
          <UserAvatar user={user} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {/* User Info Header */}
        <DropdownMenuLabel>
          <UserInfo user={user} variant="desktop" />
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Current Organization */}
        <OrganizationMenuItem
          currentOrg={currentOrg}
          onClick={() => handleNavigate('/organizations')}
          variant="dropdown"
        />

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Account */}
          <DropdownMenuItem
            onClick={() => handleNavigate('/account')}
            className="cursor-pointer"
            aria-label={t('menu.viewAccount')}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            <span>{t('menu.account')}</span>
          </DropdownMenuItem>

          {/* Preferences Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger aria-label={t('menu.openPreferences')}>
              <Settings className="mr-2 h-4 w-4" />
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
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('nav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
