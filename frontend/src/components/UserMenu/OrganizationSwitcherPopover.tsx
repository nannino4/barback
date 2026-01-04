import React from 'react';
import { Building2, ChevronDown, Check, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
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
          <Icon mode="inline" size="sm" variant="muted" className="flex-shrink-0">
            <Building2 />
          </Icon>
          <span className="truncate text-sm">
            {currentOrg?.org.name ?? t('organizations.selectVenue')}
          </span>
          <Icon mode="inline" size="xs" variant="muted" className="flex-shrink-0">
            <ChevronDown />
          </Icon>
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
            <Icon size="md" variant="muted" className="mx-auto mb-2">
              <Building2 />
            </Icon>
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
                  <Icon size="sm" variant="default">
                    <Building2 />
                  </Icon>
                  <Stack space="xs" className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">
                      {orgMembership.org.name}
                    </span>
                    <OrgRoleBadge role={orgMembership.role} />
                  </Stack>
                  {isSelected && (
                    <Icon mode="inline" size="sm" variant="primary" className="flex-shrink-0">
                      <Check />
                    </Icon>
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
          <Icon mode="inline" size="sm" variant="muted">
            <ChevronRight />
          </Icon>
        </DropdownMenuItem>

        {/* Create New */}
        <DropdownMenuItem
          onClick={handleCreateOrg}
          className="cursor-pointer"
        >
          <Icon mode="inline" size="sm" className="mr-2">
            <Plus />
          </Icon>
          {t('organizations.createOrganization')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
