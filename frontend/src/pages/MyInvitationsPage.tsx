import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageContainer, Stack, Grid } from '@/components/layout';
import { InvitationCard } from '@/components/features/organizations/InvitationCard';
import { OrganizationCardSkeleton } from '@/components/features/organizations/OrganizationCardSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useI18n } from '@/hooks/useI18n';
import { useInvitations } from '@/hooks/useInvitations';

/**
 * MyInvitationsPage - View and manage received invitations
 * 
 * Features:
 * - Display all pending invitations
 * - Accept invitation (joins organization)
 * - Decline invitation (removes invitation)
 * - Back to organizations navigation
 * - Loading and error states
 * - Empty state when no invitations
 */
export const MyInvitationsPage: React.FC = () =>
{
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const {
    pendingInvitations,
    acceptInvitation,
    declineInvitation,
    isAccepting,
    isDeclining,
    isLoading,
    error,
    invitationsQuery,
  } = useInvitations();

  // Track which invitation is being acted upon
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);

  /**
   * Handle accept invitation
   */
  const handleAccept = (id: string) =>
  {
    setAcceptingId(id);
    acceptInvitation(id, {
      onSettled: () => setAcceptingId(null),
    });
  };

  /**
   * Handle decline invitation
   */
  const handleDecline = (id: string) =>
  {
    setDecliningId(id);
    declineInvitation(id, {
      onSettled: () => setDecliningId(null),
    });
  };

  /**
   * Navigate back to organizations
   */
  const handleBackToOrganizations = () =>
  {
    void navigate('/organizations');
  };

  /**
   * Loading State
   */
  if (isLoading)
  {
    return (
      <PageContainer className="py-6">
        <Stack space="lg">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToOrganizations}
            className="-ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('invitations.backToOrganizations')}
          </Button>

          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('invitations.title')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('invitations.myInvitations')}
            </p>
          </div>

          {/* Loading Skeletons */}
          <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
          </Grid>
        </Stack>
      </PageContainer>
    );
  }

  /**
   * Error State
   */
  if (error)
  {
    return (
      <PageContainer className="py-6">
        <Stack space="lg">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToOrganizations}
            className="-ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('invitations.backToOrganizations')}
          </Button>

          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('invitations.title')}
            </h1>
          </div>

          {/* Error Display */}
          <ErrorState
            title={t('invitations.errors.loadFailed')}
            description={t('invitations.errors.loadFailedDescription')}
            onRetry={() => void invitationsQuery.refetch()}
            isRetrying={invitationsQuery.isFetching}
            retryLabel={t('common.tryAgain')}
          />
        </Stack>
      </PageContainer>
    );
  }

  /**
   * Main Content
   */
  return (
    <PageContainer className="py-6">
      <Stack space="lg">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToOrganizations}
          className="-ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('invitations.backToOrganizations')}
        </Button>

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t('invitations.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {pendingInvitations.length > 0
              ? t('invitations.pendingCount', { count: pendingInvitations.length })
              : t('invitations.myInvitations')
            }
          </p>
        </div>

        {/* Invitations List or Empty State */}
        {pendingInvitations.length === 0 ? (
          <EmptyState
            icon={Mail}
            title={t('organizations.noInvitations')}
            description={t('organizations.noInvitationsDescription')}
            action={{
              label: t('invitations.backToOrganizations'),
              onClick: handleBackToOrganizations,
            }}
            size="lg"
          />
        ) : (
          <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
            {pendingInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isAccepting={isAccepting && acceptingId === invitation.id}
                isDeclining={isDeclining && decliningId === invitation.id}
              />
            ))}
          </Grid>
        )}
      </Stack>
    </PageContainer>
  );
};
