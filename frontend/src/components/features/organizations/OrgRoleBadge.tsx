import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

interface OrgRoleBadgeProps
{
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  size?: 'sm' | 'default';
}

type OrgRoleBadgeVariant = 'org-role-owner' | 'org-role-manager' | 'org-role-staff';

const sizeClasses = {
  sm: 'px-1.5 py-0 text-[10px]',
  default: '',
};

/**
 * OrgRoleBadge - Displays organization role badge with appropriate styling
 * 
 * - Owner: Premium gradient background
 * - Manager: Primary background
 * - Staff: Outline with primary text
 */
export const OrgRoleBadge: React.FC<OrgRoleBadgeProps> = ({ role, size = 'default' }) =>
{
  const { t } = useI18n();
  
  const getVariant = (role: string): OrgRoleBadgeVariant =>
  {
    switch (role)
    {
    case 'OWNER':
      return 'org-role-owner';
    case 'MANAGER':
      return 'org-role-manager';
    case 'STAFF':
      return 'org-role-staff';
    default:
      return 'org-role-staff';
    }
  };

  const getRoleLabel = (role: string) =>
  {
    const roleKey = role.toLowerCase() as 'owner' | 'manager' | 'staff';
    return t(`organizations.role.${roleKey}`);
  };

  return (
    <Badge 
      variant={getVariant(role)}
      className={cn(sizeClasses[size])}
    >
      {getRoleLabel(role)}
    </Badge>
  );
};

