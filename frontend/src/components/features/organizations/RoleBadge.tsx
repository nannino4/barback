import React from 'react';
import { Shield, UserCog, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import type { OrgRole } from '@/types/organization';

interface RoleBadgeProps
{
  role: OrgRole;
  className?: string;
  showIcon?: boolean;
}

/**
 * RoleBadge - Display organization role with appropriate styling and icon
 * 
 * Visual hierarchy:
 * - Owner: Primary colors with crown icon
 * - Manager: Secondary colors with settings icon
 * - Staff: Outline variant with user icon
 */
export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  className,
  showIcon = true,
}) =>
{
  const { t } = useI18n();

  const getRoleIcon = () =>
  {
    switch (role)
    {
    case 'OWNER':
      return <Shield className="w-3.5 h-3.5" />;
    case 'MANAGER':
      return <UserCog className="w-3.5 h-3.5" />;
    case 'STAFF':
      return <User className="w-3.5 h-3.5" />;
    default:
      return <User className="w-3.5 h-3.5" />;
    }
  };

  const getRoleVariant = (): 'default' | 'secondary' | 'outline' =>
  {
    switch (role)
    {
    case 'OWNER':
      return 'default';
    case 'MANAGER':
      return 'secondary';
    case 'STAFF':
      return 'outline';
    default:
      return 'outline';
    }
  };

  const getRoleLabel = (): string =>
  {
    const roleKey = role.toLowerCase() as 'owner' | 'manager' | 'staff';
    return t(`organizations.role.${roleKey}`);
  };

  const getRoleColors = (): string =>
  {
    switch (role)
    {
    case 'OWNER':
      return 'bg-primary text-primary-foreground';
    case 'MANAGER':
      return 'bg-secondary text-secondary-foreground';
    case 'STAFF':
      return 'bg-background text-foreground border-border';
    default:
      return 'bg-background text-foreground border-border';
    }
  };

  return (
    <Badge
      variant={getRoleVariant()}
      className={cn(
        'font-medium',
        showIcon && 'gap-1',
        getRoleColors(),
        className,
      )}
    >
      {showIcon && getRoleIcon()}
      {getRoleLabel()}
    </Badge>
  );
};
