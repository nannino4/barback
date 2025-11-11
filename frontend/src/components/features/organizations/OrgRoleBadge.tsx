import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';

interface OrgRoleBadgeProps
{
  role: 'OWNER' | 'MANAGER' | 'STAFF';
}

type OrgRoleBadgeVariant = 'org-role-owner' | 'org-role-manager' | 'org-role-staff';

/**
 * OrgRoleBadge - Displays organization role badge with appropriate styling
 * 
 * - Owner: Premium gradient background
 * - Manager: Primary background
 * - Staff: Outline with primary text
 */
export const OrgRoleBadge: React.FC<OrgRoleBadgeProps> = ({ role }) =>
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
    <Badge variant={getVariant(role)}>
      {getRoleLabel(role)}
    </Badge>
  );
};

