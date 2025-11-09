import React from 'react';
import { Building2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import type { OrganizationMembership } from '@/types/organization';

interface OrganizationSelectCardProps
{
  organization: OrganizationMembership;
  onSelect: (org: OrganizationMembership) => void;
  isSelected?: boolean;
}

/**
 * OrganizationSelectCard - Display organization in selection list
 * 
 * Features:
 * - Organization name and icon
 * - Owner information
 * - Role badge
 * - Selection state indicator
 * - Click to select
 */
export const OrganizationSelectCard: React.FC<OrganizationSelectCardProps> = ({
  organization,
  onSelect,
  isSelected = false,
}) =>
{
  const { t } = useI18n();
  
  const getRoleBadgeVariant = (role: string) =>
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

  const getRoleLabel = (role: string) =>
  {
    const roleKey = role.toLowerCase() as 'owner' | 'manager' | 'staff';
    return t(`organizations.role.${roleKey}`);
  };

  const ownerName = `${organization.org.owner.firstName} ${organization.org.owner.lastName}`;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-lg cursor-pointer group',
        isSelected && 'border-primary shadow-md ring-2 ring-primary/20',
        !isSelected && 'hover:border-primary/50',
      )}
      onClick={() => !isSelected && onSelect(organization)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Organization Icon */}
            <div className="flex-shrink-0 mt-1">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-primary/10 text-primary group-hover:bg-primary/20",
              )}>
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            {/* Organization Info */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate mb-1">
                {organization.org.name}
              </CardTitle>
              <CardDescription>
                {t('organizations.createdBy', { name: ownerName })}
              </CardDescription>
            </div>
          </div>

          {/* Role Badge */}
          <Badge
            variant={getRoleBadgeVariant(organization.role)}
            className={cn(
              'flex-shrink-0',
              organization.role === 'OWNER' && 'bg-primary text-primary-foreground',
            )}
          >
            {getRoleLabel(organization.role)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Select Button / Selected Indicator */}
        {isSelected ? (
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-primary/10 text-primary font-medium text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('organizations.selected')}</span>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
            onClick={(e) =>
            {
              e.stopPropagation();
              onSelect(organization);
            }}
          >
            {t('organizations.select')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
