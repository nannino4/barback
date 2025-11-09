import type { User } from '@/types/user';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'lg';
  className?: string;
}

/**
 * UserAvatar - Displays user profile picture or initials
 * 
 * Shows profile picture if available, otherwise displays user initials
 * in a colored circle.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'sm',
  className = '',
}) =>
{
  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    lg: 'h-16 w-16 text-xl',
  };

  if (user.profilePictureUrl)
  {
    return (
      <img
        src={user.profilePictureUrl}
        alt={userInitials}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary flex items-center justify-center ${className}`}>
      <span className="font-semibold text-primary-foreground">
        {userInitials}
      </span>
    </div>
  );
};
