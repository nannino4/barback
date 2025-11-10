import React, { useState } from 'react';
import { Edit, Building2, Users, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stack, Grid } from '@/components/layout';
import { EditOrganizationDialog } from '@/components/features/organizations/EditOrganizationDialog';
import { useI18n } from '@/hooks/useI18n';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '@/api/organization-api';
import { invitationApi } from '@/api/invitation-api';
import type { Organization } from '@/types/organization';

interface OrganizationOverviewTabProps
{
  orgId: string;
  organization: Organization;
}

/**
 * OrganizationOverviewTab - Display organization details and quick stats
 * 
 * Features:
 * - Organization name and settings display
 * - Edit organization button (opens dialog)
 * - Quick stats cards (members count, pending invitations)
 * - Creation date display
 */
export const OrganizationOverviewTab: React.FC<OrganizationOverviewTabProps> = ({
  orgId,
  organization,
}) =>
{
  const { t } = useI18n();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  /**
   * Fetch organization members for count
   */
  const membersQuery = useQuery({
    queryKey: ['organization', orgId, 'members'],
    queryFn: () => organizationApi.getOrganizationMembers(orgId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Fetch pending invitations for count
   */
  const invitationsQuery = useQuery({
    queryKey: ['organization', orgId, 'invitations'],
    queryFn: () => invitationApi.getOrganizationInvitations(orgId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const memberCount = membersQuery.data?.length ?? 0;
  const invitationCount = invitationsQuery.data?.length ?? 0;

  return (
    <Stack space="lg">
      {/* Organization Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{t('orgManagement.overview.details')}</CardTitle>
              <CardDescription className="mt-1.5">
                {t('orgManagement.overview.detailsDescription')}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              {t('common.edit')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Stack space="md">
            {/* Organization Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('organizations.create.nameLabel')}
              </label>
              <p className="text-base mt-1">{organization.name}</p>
            </div>

            {/* Default Currency */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('orgManagement.overview.defaultCurrency')}
              </label>
              <p className="text-base mt-1">{organization.settings.defaultCurrency}</p>
            </div>
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Stack space="md">
        <h3 className="text-lg font-semibold">
          {t('orgManagement.overview.quickStats')}
        </h3>
        <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }}>
          {/* Members Count */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {t('members.title')}
                  </div>
                  <div className="text-3xl font-bold">
                    {membersQuery.isLoading ? '...' : memberCount}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Invitations Count */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {t('invitations.pendingInvitations')}
                  </div>
                  <div className="text-3xl font-bold">
                    {invitationsQuery.isLoading ? '...' : invitationCount}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {t('orgManagement.overview.organizationId')}
                  </div>
                  <div className="text-sm font-mono text-muted-foreground mt-2 break-all">
                    {organization.id}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Stack>

      {/* Edit Organization Dialog */}
      <EditOrganizationDialog
        organization={organization}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </Stack>
  );
};
