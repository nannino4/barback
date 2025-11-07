import React from 'react';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import type { OrganizationMembership } from '@/types/organization';

interface OrganizationCardProps
{
  organization: OrganizationMembership;
  onSelect: (org: OrganizationMembership) => void;
  isSelected?: boolean;
  isLoading?: boolean;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onSelect,
  isSelected = false,
  isLoading = false,
}) =>
{
  const { t } = useI18n();
  
  const getRoleBadgeVariant = (role: string) =>
  {
    switch (role)
    {
    case 'OWNER':
      return 'default'; // Will use inverted colors
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

  // Owner is always present in organization public data (populated by backend)
  const ownerName = `${organization.org.owner.firstName} ${organization.org.owner.lastName}`;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-lg cursor-pointer group',
        isSelected && 'border-primary shadow-md ring-2 ring-primary/20',
        !isSelected && 'hover:border-primary/50',
        isLoading && 'opacity-60 cursor-not-allowed',
      )}
      onClick={() => !isSelected && !isLoading && onSelect(organization)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-primary/10 text-primary group-hover:bg-primary/20",
              )}>
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {organization.org.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('organizations.createdBy', { name: ownerName })}
              </CardDescription>
            </div>
          </div>
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
        <div className={cn(
          "flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors",
          isSelected 
            ? "bg-primary/10 text-primary" 
            : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary",
        )}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {t('common.loading')}
            </span>
          ) : isSelected ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t('organizations.selected')}
            </span>
          ) : (
            t('organizations.select')
          )}
        </div>
      </CardContent>
    </Card>
  );
};
