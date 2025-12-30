import React from 'react';
import { Building2, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Stack } from '@/components/layout';
import { OrgRoleBadge } from '@/components/features/organizations/OrgRoleBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { cn } from '@/lib/utils';

interface OrganizationSwitcherSheetProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * OrganizationSwitcherSheet - Mobile bottom sheet for org switching
 * 
 * Bottom sheet showing up to 5 organizations (current first) with quick switch capability.
 */
export const OrganizationSwitcherSheet: React.FC<OrganizationSwitcherSheetProps> = ({
  open,
  onOpenChange,
}) =>
{
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const { 
    organizations, 
    currentOrg, 
    switchOrganization,
    isLoading,
  } = useOrganizations();

  const handleViewAllVenues = () =>
  {
    void navigate('/orgs');
    onOpenChange(false);
  };

  const handleSelectOrg = (org: typeof organizations[0]) =>
  {
    switchOrganization(org);
    onOpenChange(false);
  };

  // Sort organizations to put current org first, then take first 5
  const sortedOrganizations = [...organizations]
    .sort((a, b) => {
      if (a.org.id === currentOrg?.org.id) return -1;
      if (b.org.id === currentOrg?.org.id) return 1;
      return 0;
    })
    .slice(0, 5);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <div className="flex flex-col">
          {/* Organization List */}
          <div className="py-2">
            {isLoading ? (
              <div className="space-y-2 px-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : organizations.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Building2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t('organizations.noOrganizations')}
                </p>
              </div>
            ) : (
              <div className="space-y-1 px-2">
                {sortedOrganizations.map((orgMembership) =>
                {
                  const isSelected = currentOrg?.org.id === orgMembership.org.id;
                  return (
                    <button
                      key={orgMembership.org.id}
                      type="button"
                      onClick={() => handleSelectOrg(orgMembership)}
                      className={cn(
                        'w-full px-4 py-4 rounded-lg text-left transition-colors',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isSelected ? 'bg-muted' : 'hover:bg-muted/50',
                      )}
                    >
                      <Stack direction="horizontal" space="md" align="center">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <Stack space="xs" className="flex-1 min-w-0">
                          <span className="font-medium truncate">
                            {orgMembership.org.name}
                          </span>
                          <OrgRoleBadge role={orgMembership.role} />
                        </Stack>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </Stack>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* View All Venues - always shown */}
          <div className="border-t px-4 py-4">
            <button
              type="button"
              onClick={handleViewAllVenues}
              className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{t('menu.viewAllVenues')}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
