import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Mail, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrganizationCard } from '@/components/features/organizations/OrganizationCard';
import { OrganizationCardSkeleton } from '@/components/features/organizations/OrganizationCardSkeleton';
import { InvitationCard } from '@/components/features/organizations/InvitationCard';
import { CreateOrganizationDialog } from '@/components/features/organizations/CreateOrganizationDialog';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useInvitations } from '@/hooks/useInvitations';

export const OrganizationsPage: React.FC = () =>
{
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  const { currentOrg, organizations, switchOrganization, isLoading, error } = useOrganizations();
  const {
    pendingInvitations,
    acceptInvitation,
    declineInvitation,
    isAccepting,
    isDeclining,
    invitationsQuery,
  } = useInvitations();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'organizations' | 'invitations'>('organizations');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);

  // Auto-switch to invitations tab if no orgs but has invites
  useEffect(() =>
  {
    if (organizations.length === 0 && pendingInvitations.length > 0)
    {
      setActiveTab('invitations');
    }
  }, [organizations.length, pendingInvitations.length]);

  const handleSelectOrganization = (org: typeof organizations[0]) =>
  {
    switchOrganization(org, redirectTo || undefined);
  };

  const handleAcceptInvitation = (id: string) =>
  {
    setAcceptingId(id);
    acceptInvitation(id, {
      onSettled: () => setAcceptingId(null),
    });
  };

  const handleDeclineInvitation = (id: string) =>
  {
    setDecliningId(id);
    declineInvitation(id, {
      onSettled: () => setDecliningId(null),
    });
  };

  if (isLoading || invitationsQuery.isLoading)
  {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('organizations.title')}
          </h1>
        </div>

        {/* Sticky Header Skeleton */}
        <div className="sticky top-16 z-40 bg-background pb-4 -mx-4 px-4 border-b border-border mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value="organizations">
              <TabsList>
                <TabsTrigger value="organizations" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="hidden xs:inline">{t('organizations.myOrganizations')}</span>
                </TabsTrigger>
                <TabsTrigger value="invitations" className="gap-2" disabled>
                  <Mail className="w-4 h-4" />
                  <span className="hidden xs:inline">{t('organizations.invitations')}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button className="gap-2 w-full sm:w-auto" size="sm" disabled>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('organizations.createOrganization')}</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>

        {/* Skeleton Cards */}
        <div className="flex-1 overflow-y-auto -mx-4 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error)
  {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('organizations.title')}
          </h1>
        </div>

        {/* Error Card in Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg text-destructive">
                    {t('organizations.errors.loadFailed')}
                  </CardTitle>
                  <CardDescription className="mt-1 text-destructive/80">
                    {t('organizations.errors.loadFailedDescription')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full gap-2 border-destructive/30 hover:bg-destructive/10"
              >
                <RefreshCw className="w-4 h-4" />
                {t('common.tryAgain')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Page Title - Fixed */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('organizations.title')}
          </h1>
        </div>

        {/* Sticky Header: TabsList + CTA Button */}
        <div className="sticky top-16 z-40 bg-background pb-4 -mx-4 px-4 border-b border-border mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList>
              <TabsTrigger value="organizations" className="gap-2">
                <Building2 className="w-4 h-4" />
                <span className="hidden xs:inline">{t('organizations.myOrganizations')}</span>
                <span className="xs:hidden">Venues</span>
              </TabsTrigger>
              <TabsTrigger value="invitations" className="gap-2">
                <Mail className="w-4 h-4" />
                <span className="hidden xs:inline">
                  {pendingInvitations.length > 0
                    ? t('organizations.invitationsCount', { count: pendingInvitations.length })
                    : t('organizations.invitations')
                  }
                </span>
                <span className="xs:hidden">
                  {pendingInvitations.length > 0 ? `(${pendingInvitations.length})` : 'Invites'}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* CTA Button - Always visible */}
            <Button 
              onClick={() => setCreateDialogOpen(true)} 
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('organizations.createOrganization')}</span>
              <span className="sm:hidden">{t('organizations.createOrganization')}</span>
            </Button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto -mx-4 px-4">
          {/* Organizations Tab */}
          <TabsContent value="organizations" className="mt-0">
            {organizations.length === 0 ? (
              <div className="border border-dashed rounded-lg p-8 sm:p-12 text-center">
                <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {t('organizations.noOrganizations')}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t('organizations.noOrganizationsDescription')}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setCreateDialogOpen(true)} 
                    className="gap-2 mt-2"
                    size="lg"
                  >
                    <Plus className="w-4 h-4" />
                    {t('organizations.createOrganization')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                {organizations.map((org) => (
                  <OrganizationCard
                    key={org.org.id}
                    organization={org}
                    onSelect={handleSelectOrganization}
                    isSelected={currentOrg?.org.id === org.org.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="mt-0">
            {invitationsQuery.error ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-destructive">
                          {t('invitations.errors.loadFailed')}
                        </CardTitle>
                        <CardDescription className="mt-1 text-destructive/80">
                          {t('invitations.errors.loadFailedDescription')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => void invitationsQuery.refetch()}
                      variant="outline"
                      className="w-full gap-2 border-destructive/30 hover:bg-destructive/10"
                      disabled={invitationsQuery.isFetching}
                    >
                      <RefreshCw className={`w-4 h-4 ${invitationsQuery.isFetching ? 'animate-spin' : ''}`} />
                      {invitationsQuery.isFetching ? t('common.loading') : t('common.tryAgain')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : pendingInvitations.length === 0 ? (
              <div className="border border-dashed rounded-lg p-8 sm:p-12 text-center">
                <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {t('organizations.noInvitations')}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {t('organizations.noInvitationsDescription')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                {pendingInvitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onAccept={handleAcceptInvitation}
                    onDecline={handleDeclineInvitation}
                    isAccepting={isAccepting && acceptingId === invitation.id}
                    isDeclining={isDeclining && decliningId === invitation.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </div>

        {/* Create Organization Dialog */}
        <CreateOrganizationDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </Tabs>
  );
};
