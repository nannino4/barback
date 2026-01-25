import React, { useState } from 'react';
import { Building2, ChevronDown, Check, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Stack } from '@/components/layout';
import { OrgRoleBadge } from '@/components/features/organizations/OrgRoleBadge';
import { InvitationsBadge } from '@/components/features/invitations/InvitationsBadge';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { cn } from '@/lib/utils';

/**
 * OrgSwitcherSheet - Mobile bottom sheet for organization switching
 * 
 * Shows as a bottom sheet on mobile, provides same functionality
 * as the desktop popover but with better touch interaction.
 */
export const OrgSwitcherSheet: React.FC = () =>
{
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  
  const { 
    organizations, 
    currentOrg, 
    switchOrganization, 
  } = useOrganizations();

  const handleSwitch = (orgMembership: typeof organizations[0]) =>
  {
    switchOrganization(orgMembership);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
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
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl max-h-[80vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>
            <Stack direction="horizontal" justify="between" align="center">
              <span>{t('menu.myVenues')}</span>
              <InvitationsBadge showIcon />
            </Stack>
          </SheetTitle>
        </SheetHeader>

        {/* Organization List */}
        <div className="space-y-1">
          {organizations.length === 0 ? (
            <div className="py-8 text-center">
              <Icon size="lg" variant="muted" className="mx-auto mb-3">
                <Building2 />
              </Icon>
              <p className="text-sm text-muted-foreground">
                {t('organizations.noOrganizations')}
              </p>
            </div>
          ) : (
            organizations.map((orgMembership) =>
            {
              const isSelected = currentOrg?.org.id === orgMembership.org.id;
              return (
                <button
                  type="button"
                  key={orgMembership.org.id}
                  onClick={() => handleSwitch(orgMembership)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                    'hover:bg-muted active:bg-muted/80',
                    isSelected && 'bg-muted',
                  )}
                >
                  <Icon size="sm" variant="default">
                    <Building2 />
                  </Icon>
                  <Stack space="xs" className="flex-1 min-w-0 text-left">
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
                </button>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-border space-y-1">
          {/* View All Venues */}
          <Link
            to="/orgs"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <span className="flex-1 text-sm">
              {t('menu.viewAllVenues')}
              {organizations.length > 5 && (
                <span className="ml-1 text-muted-foreground">({organizations.length})</span>
              )}
            </span>
            <Icon mode="inline" size="sm" variant="muted">
              <ChevronRight />
            </Icon>
          </Link>

          {/* Create New */}
          <Link
            to="/orgs/create"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <Icon mode="inline" size="sm">
              <Plus />
            </Icon>
            <span className="text-sm">{t('organizations.createOrganization')}</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};
