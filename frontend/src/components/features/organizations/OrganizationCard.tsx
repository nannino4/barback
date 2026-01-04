import React from 'react';
import { Building2, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { InlineSpinner } from '@/components/ui/spinner';
import { Stack } from '@/components/layout';
import { UserInfo } from '@/components/user';
import { OrgRoleBadge } from './OrgRoleBadge';
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

/**
 * OrganizationCard - Displays an organization membership with select and navigate actions
 * 
 * Design principles:
 * - Tapping the card selects the organization as the working context
 * - Chevron button navigates to organization detail/management page
 * - Clear visual feedback for selected state
 * - Mobile-first with proper touch targets (min 44px)
 * - Role badge shows user's role in the organization
 * - Owner info provides context about who owns the venue
 */
export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  onSelect,
  isSelected = false,
  isLoading = false,
}) =>
{
  const { t } = useI18n();

  const handleCardClick = () =>
  {
    if (!isLoading)
    {
      onSelect(organization);
    }
  };

  const handleNavigateClick = (e: React.MouseEvent) =>
  {
    e.stopPropagation();
  };

  const handleKeyDown = (e: React.KeyboardEvent) =>
  {
    if (e.key === 'Enter' || e.key === ' ')
    {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Card
      variant={isSelected ? 'highlighted' : 'default'}
      className={cn(
        'cursor-pointer transition-all',
        'hover:shadow-md hover:border-primary/30',
        isLoading && 'opacity-60 pointer-events-none',
      )}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={t('organizations.switchTo', { name: organization.org.name })}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent>
        <Stack direction="horizontal" space="md" align="center">
          {/* Organization Icon with Selection Indicator */}
          <div className="relative flex-shrink-0">
            <div 
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-primary/10 text-primary',
              )}
            >
              {isLoading ? (
                <InlineSpinner className="w-5 h-5" />
              ) : isSelected ? (
                <Check className="w-6 h-6" />
              ) : (
                <Building2 className="w-6 h-6" />
              )}
            </div>
          </div>

          {/* Organization Info */}
          <Stack space="sm" className="flex-1 min-w-0">
            <OrgRoleBadge role={organization.role} size="sm" />
            <Stack space='xs'>
              <span className="font-semibold text-base truncate">
                {organization.org.name}
              </span>
              <UserInfo
                user={organization.org.owner}
                size="sm"
                className="text-muted-foreground"
              />
            </Stack>
          </Stack>

          {/* Navigate to Details Button */}
          <Link
            to={`/orgs/${organization.org.id}`}
            state={{ userOrgRole: organization.role }}
            onClick={handleNavigateClick}
            className={cn(
              'flex-shrink-0 p-3 -m-2 rounded-lg transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
            aria-label={t('organizations.viewDetails')}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
};
