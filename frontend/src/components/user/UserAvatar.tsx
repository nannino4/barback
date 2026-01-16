import { cn } from '@/lib/utils';
import type { User, UserPublic } from '@/types/user';

interface UserAvatarProps
{
  user: User | UserPublic;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-5 w-5 text-sm',
  md: 'h-8 w-8 text-base',
  lg: 'h-12 w-12 text-xl',
  xl: 'h-24 w-24 text-2xl',
};

/**
 * UserAvatar - Displays user profile picture or initials
 * 
 * Shows profile picture if available, otherwise displays user initials
 * in a colored circle.
 * 
 * @param user - User or UserPublic object containing firstName, lastName, and optional profilePictureUrl
 * @param size - Avatar size: 'sm' (20px), 'md' (32px), or 'lg' (48px)
 * @param className - Additional CSS classes
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'sm',
  className,
}) =>
{
  const firstInitial = user.firstName?.trim()?.charAt(0) ?? '';
  const lastInitial = user.lastName?.trim()?.charAt(0) ?? '';
  const userInitials = `${firstInitial}${lastInitial}`.toUpperCase() || '?';

  if (user.profilePictureUrl)
  {
    return (
      <img
        src={user.profilePictureUrl}
        alt={userInitials}
        className={cn(
          sizeClasses[size],
          'rounded-full object-cover',
          className,
        )}
      />
    );
  }

  return (
    <div 
      className={cn(
        sizeClasses[size],
        'rounded-full bg-primary flex items-center justify-center',
        className,
      )}
    >
      <span className="font-semibold text-primary-foreground">
        {userInitials}
      </span>
    </div>
  );
};
