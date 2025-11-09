import type { User } from '@/types/user';
import { UserAvatar } from './UserAvatar';

interface UserInfoProps {
  user: User;
  variant: 'desktop' | 'mobile';
}

/**
 * UserInfo - Displays user information header
 * 
 * Desktop: Compact display with name and email in DropdownMenuLabel
 * Mobile: Larger display with avatar, name, and email
 */
export const UserInfo: React.FC<UserInfoProps> = ({ user, variant }) =>
{
  const userFullName = `${user.firstName} ${user.lastName}`;

  if (variant === 'desktop')
  {
    return (
      <div className="flex flex-col space-y-1 font-normal">
        <p className="text-sm font-medium leading-none">{userFullName}</p>
        <p className="text-xs leading-none text-muted-foreground">
          {user.email}
        </p>
      </div>
    );
  }

  // Mobile variant
  return (
    <div className="flex items-center gap-4 pb-6 border-b border-border">
      <UserAvatar user={user} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold truncate">{userFullName}</p>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
      </div>
    </div>
  );
};
