import React from 'react';
import { LogOut, Building2, ChevronRight, Settings } from 'lucide-react';
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

export const UserMenu: React.FC = () =>
{
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { currentOrg, organizations, switchOrganization } = useOrganizations();

  if (!user)
  {
    return null;
  }

  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const userFullName = `${user.firstName} ${user.lastName}`;

  const getRoleLabel = (role: string) =>
  {
    const roleKey = role.toLowerCase() as 'owner' | 'manager' | 'staff';
    return t(`organizations.role.${roleKey}`);
  };

  const handleOrgSwitch = (org: typeof organizations[0]) =>
  {
    switchOrganization(org);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          {user.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={userInitials}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">
                {userInitials}
              </span>
            </div>
          )}
          <span className="text-sm font-medium hidden sm:inline-block">
            {user.firstName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1 font-normal">
            <p className="text-sm font-medium leading-none">{userFullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Current Organization */}
        {currentOrg ? (
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-2 py-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t('organizations.selectOrganization')}
                </p>
                <p className="text-sm font-medium truncate">
                  {currentOrg.org.name}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-2 py-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {t('organizations.noOrganizations')}
              </p>
            </div>
          </DropdownMenuLabel>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Organization Switcher */}
          {organizations.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Building2 className="mr-2 h-4 w-4" />
                <span>{t('organizations.switchOrganization', 'Switch Organization')}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                {organizations.map((org) => (
                  <DropdownMenuItem
                    key={org.org.id}
                    onClick={() => handleOrgSwitch(org)}
                    className="cursor-pointer flex items-center justify-between"
                    disabled={currentOrg?.org.id === org.org.id}
                  >
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="text-sm truncate">{org.org.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {getRoleLabel(org.role)}
                      </span>
                    </div>
                    {currentOrg?.org.id === org.org.id && (
                      <ChevronRight className="ml-2 h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* Manage Organizations */}
          <DropdownMenuItem
            onClick={() => void navigate('/organizations')}
            className="cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('organizations.manageOrganizations', 'Manage Organizations')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

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
