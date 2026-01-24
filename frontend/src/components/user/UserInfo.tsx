import type { UserResponse, UserPublicResponse } from '@/types/user';
import { UserAvatar } from './UserAvatar';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

interface UserInfoProps
{
  user: UserResponse | UserPublicResponse;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

/**
 * UserInfo - Displays user information with avatar and optional name
 * 
 * @param user - User or UserPublic object containing firstName, lastName, and optional profilePictureUrl
 * @param size - Size variant: 'sm', 'md', or 'lg' (affects both avatar and text)
 * @param showName - Whether to display the user's full name (default: true)
 * @param className - Additional CSS classes
 */
export const UserInfo: React.FC<UserInfoProps> = ({ 
  user, 
  size = 'sm',
  showName = true,
  className,
}) =>
{
  const { t } = useI18n();
  const userFullName = `${user.firstName} ${user.lastName}`.trim();
  const displayName = userFullName || t('common.userWithoutName');

  if (!showName)
  {
    return <UserAvatar user={user} size={size} className={className} />;
  }

  return (
    <Stack 
      direction="horizontal" 
      space={size}
      align="center"
      className={className}
    >
      <UserAvatar user={user} size={size} />
      <span 
        className={cn(
          textSizeClasses[size],
          'font-medium truncate',
        )}
      >
        {displayName}
      </span>
    </Stack>
  );
};
