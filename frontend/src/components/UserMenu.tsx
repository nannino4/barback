import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';

export const UserMenu: React.FC = () =>
{
  const { user, logout } = useAuth();
  const { t } = useI18n();

  if (!user)
  {
    return null;
  }

  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const userFullName = `${user.firstName} ${user.lastName}`;

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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1 font-normal">
            <p className="text-sm font-medium leading-none">{userFullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
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
