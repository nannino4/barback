import React from 'react';
import { Building2, ChevronDown, Check, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Stack } from '@/components/layout';
import { OrgRoleBadge } from '@/components/features/organizations/OrgRoleBadge';
import { InvitationsBadge } from '@/components/features/invitations/InvitationsBadge';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { cn } from '@/lib/utils';

/**
 * OrganizationSwitcherPopover - Desktop quick org switch dropdown
 * 
 * Shows in the header nav, allows quick switching between organizations
 * without navigating to the full /orgs page.
 */
export const OrganizationSwitcherPopover: React.FC = () =>
{
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const { 
    organizations, 
    currentOrg, 
    switchOrganization, 
  } = useOrganizations();

  const handleViewAllVenues = () =>
  {
    void navigate('/orgs');
  };

  const handleCreateOrg = () =>
  {
    void navigate('/orgs/create');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 max-w-[200px]"
          aria-label={t('menu.switchVenue')}
        >
          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate text-sm">
            {currentOrg?.org.name ?? t('organizations.selectVenue')}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="start">
        {/* Header */}
        <DropdownMenuLabel>
          <Stack direction="horizontal" justify="between" align="center">
            <span>{t('menu.myVenues')}</span>
            <InvitationsBadge showIcon />
          </Stack>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Organization List */}
        {organizations.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <Building2 className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t('organizations.noOrganizations')}
            </p>
          </div>
        ) : (
          organizations.slice(0, 5).map((orgMembership) =>
          {
            const isSelected = currentOrg?.org.id === orgMembership.org.id;
            return (
              <DropdownMenuItem
                key={orgMembership.org.id}
                onClick={() => switchOrganization(orgMembership)}
                className={cn(
                  'cursor-pointer py-3',
                  isSelected && 'bg-muted',
                )}
              >
                <Stack direction="horizontal" space="md" align="center" className="w-full">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <Stack space="xs" className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">
                      {orgMembership.org.name}
                    </span>
                    <OrgRoleBadge role={orgMembership.role} />
                  </Stack>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </Stack>
              </DropdownMenuItem>
            );
          })
        )}

        <DropdownMenuSeparator />

        {/* View All Venues */}
        <DropdownMenuItem
          onClick={handleViewAllVenues}
          className="cursor-pointer"
        >
          <span className="flex-1">
            {t('menu.viewAllVenues')}
            {organizations.length > 5 && (
              <span className="ml-1 text-muted-foreground">({organizations.length})</span>
            )}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuItem>

        {/* Create New */}
        <DropdownMenuItem
          onClick={handleCreateOrg}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('organizations.createOrganization')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
