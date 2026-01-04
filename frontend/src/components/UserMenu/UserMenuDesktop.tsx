import { useState } from 'react';
import { LogOut, Settings, Building2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { OrgRoleBadge } from '@/components/features/organizations/OrgRoleBadge';
import { InvitationsBadge } from '@/components/features/invitations/InvitationsBadge';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';
import { Stack } from '@/components/layout';
import { cn } from '@/lib/utils';

/**
 * UserMenuDesktop - Desktop dropdown menu implementation
 * 
 * Compact dropdown menu with user info, organization switcher, account, preferences submenu, and logout.
 */
export const UserMenuDesktop: React.FC = () =>
{
  const { user, logout } = useAuth();
  const { t, changeLanguage, currentLanguage } = useI18n();
  const navigate = useNavigate();
  const { currentOrg, organizations, switchOrganization } = useOrganizations();
  const { theme, setTheme } = useThemeStore();
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);

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
          <UserAvatar user={user} size="md" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {/* User Info - navigates to profile */}
        <DropdownMenuItem
          onClick={() => handleNavigate('/account')}
          className="cursor-pointer"
          aria-label={t('menu.viewAccount')}
        >
          <UserInfo user={user} size="md" className="w-full" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Organization Quick Switch Submenu */}
        <DropdownMenuSub open={isOrgSwitcherOpen} onOpenChange={setIsOrgSwitcherOpen}>
          <DropdownMenuSubTrigger className="cursor-pointer">
            {currentOrg ? (
              <Stack space="xs" className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t('menu.currentVenue')}
                </p>
                <p className="text-sm font-medium truncate">
                  {currentOrg.org.name}
                </p>
              </Stack>
            ) : (
              <span className="flex-1 text-sm text-muted-foreground">
                {t('menu.noVenueSelected')}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-72">
            {/* Organization List - current org first */}
            {organizations.length === 0 ? (
              <div className="px-2 py-4 text-center">
                <Building2 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('organizations.noOrganizations')}
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {[...organizations]
                  .sort((a, b) =>
                  {
                    if (a.org.id === currentOrg?.org.id) return -1;
                    if (b.org.id === currentOrg?.org.id) return 1;
                    return 0;
                  })
                  .map((orgMembership) =>
                  {
                    const isSelected = currentOrg?.org.id === orgMembership.org.id;
                    return (
                      <DropdownMenuItem
                        key={orgMembership.org.id}
                        onClick={() =>
                        {
                          switchOrganization(orgMembership);
                          setIsOrgSwitcherOpen(false);
                        }}
                        className={cn(
                          'cursor-pointer py-3',
                          isSelected && 'bg-muted',
                        )}
                      >
                        <Stack direction="horizontal" space="md" align="center" className="w-full">
                          <Icon size="sm" variant="default">
                            <Building2 />
                          </Icon>
                          <Stack space="xs" className="flex-1 min-w-0">
                            <span className="font-medium text-sm truncate">
                              {orgMembership.org.name}
                            </span>
                            <OrgRoleBadge role={orgMembership.role} size="sm" />
                          </Stack>
                          {isSelected && (
                            <Icon mode="inline" size="sm" variant="primary" className="flex-shrink-0">
                              <Check />
                            </Icon>
                          )}
                        </Stack>
                      </DropdownMenuItem>
                    );
                  })}
              </div>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* My Venues - direct link */}
        <DropdownMenuItem
          onClick={() => handleNavigate('/orgs')}
          className="cursor-pointer"
        >
          <Icon mode="inline" size="sm" className="mr-2">
            <Building2 />
          </Icon>
          <span>{t('menu.myVenues')}</span>
          <InvitationsBadge className="ml-auto" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Preferences Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger aria-label={t('menu.openPreferences')}>
            <Icon mode="inline" size="sm" className="mr-2">
              <Settings />
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
