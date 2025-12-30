import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Building2, Users, RefreshCw, UserPlus, Loader2, Settings, LogOut, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer, Stack, Grid, Section } from '@/components/layout';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { SubscriptionCard } from '@/components/features/organizations/SubscriptionCard';
import { SubscriptionCardSkeleton } from '@/components/features/organizations/SubscriptionCardSkeleton';
import { MemberCard } from '@/components/features/organizations/MemberCard';
import { MemberCardSkeleton } from '@/components/features/organizations/MemberCardSkeleton';
import { SendInvitationDialog } from '@/components/features/organizations/SendInvitationDialog';
import { InlineEditField } from '@/components/forms/InlineEditField';
import { InlineEditSelect } from '@/components/forms/InlineEditSelect';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';
import { organizationApi } from '@/api/organization-api';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';
import { MIN_LOADING_FEEDBACK_MS } from '@/constants/constants';
import type { Subscription, SubscriptionStatusOnly } from '@/types/subscription';
import type { OrgRole } from '@/types/organization';
import toast from 'react-hot-toast';

/** Navigation state passed when navigating to this page */
interface LocationState
{
  userOrgRole?: OrgRole;
}

/**
 * OrganizationManagePage - Management page for a single organization
 * 
 * Shows:
 * - Organization details (name, settings)
 * - Subscription status and info
 * - Team members list
 * 
 * Access: Owner, Manager, Staff (different features based on role)
 * 
 * Role-based features:
 * - Owner: All features (edit name, settings, members, subscription)
 * - Manager: View all, invite members, remove staff
 * - Staff: View only
 * 
 * Note: User role is passed via navigation state for immediate access,
 * with fallback to members query if navigated directly.
 */
export const OrganizationManagePage: React.FC = () =>
{
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const currentUser = useAuthStore((state) => state.user);
  
  // Get user role from navigation state (passed from OrganizationsPage or CreateOrganizationPage)
  const locationState = location.state as LocationState | null;
  const userOrgRoleFromState = locationState?.userOrgRole;

  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch organization details
  const {
    data: organization,
    isLoading: isLoadingOrg,
    error: orgError,
    refetch: refetchOrg,
  } = useQuery({
    queryKey: queryKeys.organizations.detail(orgId ?? ''),
    queryFn: () => organizationApi.getOrganizationById(orgId ?? ''),
    enabled: Boolean(orgId),
    staleTime: CACHE_TIMES.ORGANIZATIONS,
  });

  // Fetch organization members (needed for members list, also provides fallback role)
  const {
    data: members,
    isLoading: isLoadingMembers,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: queryKeys.organizations.members(orgId ?? ''),
    queryFn: () => organizationApi.getOrganizationMembers(orgId ?? ''),
    enabled: Boolean(orgId),
    staleTime: CACHE_TIMES.ORGANIZATIONS,
  });

  // Determine user role: prefer navigation state, fallback to members query
  const currentUserMembership = members?.find(
    (m) => m.user.id === currentUser?.id,
  );
  const userOrgRoleFromMembers = currentUserMembership?.role;
  const userOrgRole = userOrgRoleFromState ?? userOrgRoleFromMembers;
  
  // Role is known if passed via navigation state OR members have loaded
  const isRoleKnown = Boolean(userOrgRoleFromState) || Boolean(members);
  
  const isOwner = userOrgRole === 'OWNER';
  const isManager = userOrgRole === 'MANAGER';
  const canManageMembers = isOwner || isManager;
  const canEditSettings = isOwner;

  // Fetch full subscription details (owner only)
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: queryKeys.organizations.subscription(orgId ?? ''),
    queryFn: () => organizationApi.getOrganizationSubscription(orgId ?? ''),
    // Fetch immediately if we know user is owner (from state or members)
    enabled: Boolean(orgId) && isRoleKnown && isOwner,
    staleTime: CACHE_TIMES.ORGANIZATIONS,
  });

  // Fetch subscription status only (for non-owners)
  const {
    data: subscriptionStatus,
    isLoading: isLoadingSubscriptionStatus,
    error: subscriptionStatusError,
    refetch: refetchSubscriptionStatus,
  } = useQuery({
    queryKey: queryKeys.organizations.subscriptionStatus(orgId ?? ''),
    queryFn: () => organizationApi.getOrganizationSubscriptionStatus(orgId ?? ''),
    // Fetch immediately if we know user is not owner (from state or members)
    enabled: Boolean(orgId) && isRoleKnown && !isOwner,
    staleTime: CACHE_TIMES.ORGANIZATIONS,
  });

  // Combined subscription data - full subscription for owners, status only for others
  const subscriptionData: Subscription | SubscriptionStatusOnly | undefined = isOwner 
    ? subscription 
    : subscriptionStatus;

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) =>
    {
      return organizationApi.removeMember(orgId ?? '', userId);
    },
    onSuccess: () =>
    {
      toast.success(t('members.remove.success'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(orgId ?? '') });
      setRemoveMemberDialogOpen(false);
      setMemberToRemove(null);
    },
    onError: () =>
    {
      toast.error(t('members.remove.error'));
    },
  });

  // Leave organization mutation
  const leaveOrgMutation = useMutation({
    mutationFn: async () =>
    {
      return organizationApi.leaveOrganization(orgId ?? '');
    },
    onSuccess: () =>
    {
      toast.success(t('members.leave.success'));
      // Invalidate all organization queries and navigate away
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      navigate('/orgs');
    },
    onError: () =>
    {
      toast.error(t('members.leave.error'));
      setLeaveDialogOpen(false);
    },
  });

  // Update organization mutation
  const updateOrgMutation = useMutation({
    mutationFn: async (data: { name?: string; settings?: { defaultCurrency?: string } }) =>
    {
      return organizationApi.updateOrganization(orgId ?? '', data);
    },
    onSuccess: () =>
    {
      toast.success(t('orgManagement.overview.edit.success'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(orgId ?? '') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
    onError: () =>
    {
      toast.error(t('orgManagement.overview.edit.error'));
    },
  });

  // Loading state: org and members must load; subscription loads based on role
  // If role is known from navigation state, subscription query can start immediately
  const isLoadingSubscriptionData = isOwner ? isLoadingSubscription : isLoadingSubscriptionStatus;
  const isLoading = isLoadingOrg || isLoadingMembers || (isRoleKnown && isLoadingSubscriptionData);
  const error = orgError ?? membersError ?? (isOwner ? subscriptionError : subscriptionStatusError);

  const handleBack = () =>
  {
    void navigate('/orgs');
  };

  const handleRefresh = async () =>
  {
    setIsRefreshing(true);
    
    // Refetch based on user role
    const subscriptionRefetch = isOwner ? refetchSubscription() : refetchSubscriptionStatus();
    
    // Run refresh and minimum delay in parallel
    await Promise.all([
      Promise.all([refetchOrg(), subscriptionRefetch, refetchMembers()]),
      new Promise(resolve => setTimeout(resolve, MIN_LOADING_FEEDBACK_MS)),
    ]);
    
    setIsRefreshing(false);
  };

  const handleRemoveMember = (userId: string) =>
  {
    setMemberToRemove(userId);
    setRemoveMemberDialogOpen(true);
  };

  const confirmRemoveMember = () =>
  {
    if (memberToRemove)
    {
      removeMemberMutation.mutate(memberToRemove);
    }
  };

  const handleLeaveOrganization = () =>
  {
    setLeaveDialogOpen(true);
  };

  const confirmLeaveOrganization = () =>
  {
    leaveOrgMutation.mutate();
  };

  // Currency options for inline edit
  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
  ];

  // Member to remove details
  const memberToRemoveDetails = memberToRemove
    ? members?.find((m) => m.user.id === memberToRemove)
    : null;

  // Non-owners can leave
  const canLeave = !isOwner && isRoleKnown;

  // Skeleton loading state
  const renderSkeletonLoading = () => (
    <PageContainer className="py-6">
      <Stack space="lg" className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Organization header skeleton */}
        <Section>
          <Stack direction="horizontal" space="lg" align="center">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <Stack space="xs" className="flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </Stack>
          </Stack>
        </Section>

        {/* Subscription skeleton */}
        <Section>
          <SubscriptionCardSkeleton showAction />
        </Section>

        {/* Members skeleton */}
        <Section>
          <Card>
            <CardHeader>
              <Stack direction="horizontal" justify="between" align="center">
                <Stack direction="horizontal" space="sm" align="center">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-5 w-24" />
                </Stack>
                <Skeleton className="h-4 w-20" />
              </Stack>
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
                <MemberCardSkeleton />
                <MemberCardSkeleton />
                <MemberCardSkeleton showAction />
              </Grid>
            </CardContent>
          </Card>
        </Section>
      </Stack>
    </PageContainer>
  );

  // Loading state with skeletons
  if (isLoading)
  {
    return renderSkeletonLoading();
  }

  // Error state
  if (error || !organization || !subscriptionData)
  {
    return (
      <PageContainer className="py-6">
        <Stack space="lg" className="max-w-4xl mx-auto">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t('common.back')}
            </Button>
          </div>
          <ErrorState
            title={t('organizations.errors.loadFailed')}
            description={t('organizations.errors.loadFailedDescription')}
            onRetry={handleRefresh}
            retryLabel={t('common.tryAgain')}
          />
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6">
      <Stack space="lg" className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('common.back')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="text-muted-foreground"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1" />
            )}
            {t('common.refresh')}
          </Button>
        </div>

        {/* Organization Header */}
        <Section>
          <Stack direction="horizontal" space="lg" align="center" className="flex-wrap">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <Stack space="xs" className="flex-1 min-w-0">
              {canEditSettings ? (
                <InlineEditField
                  value={organization.name}
                  onSave={async (newName) =>
                  {
                    await updateOrgMutation.mutateAsync({ name: newName });
                  }}
                  label={t('organizations.create.nameLabel')}
                  canEdit={canEditSettings}
                  minLength={2}
                  maxLength={100}
                  textClassName="text-2xl sm:text-3xl font-bold tracking-tight"
                  inputClassName="text-2xl sm:text-3xl font-bold tracking-tight"
                  alwaysShowEdit
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                  {organization.name}
                </h1>
              )}
              <p className="text-muted-foreground">
                {t('orgManagement.description')}
              </p>
            </Stack>
          </Stack>
        </Section>

        {/* Subscription Section */}
        <Section>
          <SubscriptionCard subscriptionData={subscriptionData} isOwner={isOwner} />
        </Section>

        {/* Members Section */}
        <Section>
          <Card>
            <CardHeader>
              <Stack direction="horizontal" justify="between" align="center" className="flex-wrap gap-2">
                <Stack direction="horizontal" space="sm" align="center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>{t('orgManagement.members.title')}</CardTitle>
                </Stack>
                <Stack direction="horizontal" space="sm" align="center">
                  <span className="text-sm text-muted-foreground">
                    {t('organizations.members', { count: members?.length ?? 0 })}
                  </span>
                  {canManageMembers && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInviteDialogOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {t('invitations.send.sendButton')}
                    </Button>
                  )}
                </Stack>
              </Stack>
              <CardDescription>
                {t('orgManagement.members.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Stack space="md">
                {isLoadingMembers ? (
                  <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
                    <MemberCardSkeleton />
                    <MemberCardSkeleton />
                  </Grid>
                ) : members && members.length > 0 ? (
                  <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }}>
                    {members.map((member) => (
                      <MemberCard
                        key={member.user.id}
                        member={member}
                        currentUserId={currentUser?.id ?? ''}
                        isOwner={isOwner}
                        onRemove={canManageMembers ? handleRemoveMember : undefined}
                        isRemoving={removeMemberMutation.isPending && memberToRemove === member.user.id}
                      />
                    ))}
                  </Grid>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t('orgManagement.members.noMembers')}
                  </p>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Section>

        {/* Organization Settings Section (Owner only) */}
        {canEditSettings && (
          <Section>
            <Card>
              <CardHeader>
                <Stack direction="horizontal" space="sm" align="center">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <CardTitle>{t('orgManagement.settings.title')}</CardTitle>
                </Stack>
                <CardDescription>
                  {t('orgManagement.settings.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Stack space="md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">
                        {t('orgManagement.settings.currency')}
                      </span>
                      <InlineEditSelect
                        value={organization.settings.defaultCurrency}
                        options={currencyOptions}
                        onSave={async (_newCurrency) =>
                        {
                          // TODO: Implement currency update API
                          toast.error('Currency update not implemented yet');
                        }}
                        label={t('orgManagement.settings.currency')}
                        canEdit={canEditSettings}
                        alwaysShowEdit
                      />
                    </div>
                  </div>
                </Stack>
              </CardContent>
            </Card>
          </Section>
        )}

        {/* Danger Zone - Leave Organization (non-owners only) */}
        {canLeave && (
          <Section>
            <Card className="border-destructive/50">
              <CardHeader>
                <Stack direction="horizontal" space="sm" align="center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <CardTitle className="text-destructive">{t('common.dangerZone')}</CardTitle>
                </Stack>
                <CardDescription>
                  {t('members.leave.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleLeaveOrganization}
                  disabled={leaveOrgMutation.isPending}
                >
                  {leaveOrgMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('members.leave.leaving')}
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('members.leave.button')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </Section>
        )}
      </Stack>

      {/* Dialogs */}
      <SendInvitationDialog
        orgId={orgId ?? ''}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <ConfirmationDialog
        open={removeMemberDialogOpen}
        onOpenChange={setRemoveMemberDialogOpen}
        title={t('members.remove.confirm')}
        description={t('members.remove.confirmDescription', { 
          name: memberToRemoveDetails 
            ? `${memberToRemoveDetails.user.firstName} ${memberToRemoveDetails.user.lastName}`.trim() || memberToRemoveDetails.user.email
            : '',
        })}
        confirmLabel={t('members.remove.button')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmRemoveMember}
        isLoading={removeMemberMutation.isPending}
        variant="destructive"
      />

      <ConfirmationDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        title={t('members.leave.confirm')}
        description={t('members.leave.confirmDescription')}
        confirmLabel={t('members.leave.button')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmLeaveOrganization}
        isLoading={leaveOrgMutation.isPending}
        variant="destructive"
      />
    </PageContainer>
  );
};
