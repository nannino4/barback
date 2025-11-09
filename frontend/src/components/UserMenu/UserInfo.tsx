import type { User } from '@/types/user';
import { UserAvatar } from './UserAvatar';
import { Stack } from '../layout';

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
      <Stack space="xs" className="font-normal">
        <p className="text-sm font-medium leading-none">{userFullName}</p>
        <p className="text-xs leading-none text-muted-foreground">
          {user.email}
        </p>
      </Stack>
    );
  }

  // Mobile variant
  return (
    <Stack direction="horizontal" space="md" align="center">
      <UserAvatar user={user} size="lg" />
      <Stack space="xs" className="flex-1 min-w-0">
        <p className="text-lg font-semibold truncate">{userFullName}</p>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
      </Stack>
    </Stack>
  );
};
