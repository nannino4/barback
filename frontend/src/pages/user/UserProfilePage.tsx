import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';
import { Stack } from '@/components/layout/Stack';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineEditField } from '@/components/forms/InlineEditField';
import { UserAvatar } from '@/components/user/UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useI18n } from '@/hooks/useI18n';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/api/user-api';
import { organizationApi } from '@/api/organization-api';
import { queryKeys } from '@/lib/queryKeys';
import { CACHE_TIMES } from '@/constants/cacheTimes';
import { Mail, Phone, Upload } from 'lucide-react';
import type { Subscription, SubscriptionStatus } from '@/types/subscription';
import type { OrganizationMembership } from '@/types/organization';

/**
 * UserProfilePage - User account information display
 *
 * Draft placeholder for future profile management features.
 */
export function UserProfilePage()
{
  const { user } = useAuth();
  const { t } = useI18n();
  const setUser = useAuthStore((state) => state.setUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { useOrganizationsByRole } = useOrganizations();

  const meQuery = useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => userApi.getMe(),
    enabled: Boolean(user),
    staleTime: CACHE_TIMES.SUBSCRIPTIONS,
  });

  useEffect(() =>
  {
    if (meQuery.data)
    {
      setUser(meQuery.data);
    }
  }, [meQuery.data, setUser]);

  const currentUser = meQuery.data ?? user;

  const ownedOrgsQuery = useOrganizationsByRole('OWNER');

  const ownedOrgs = ownedOrgsQuery.data ?? [];

  const ownedOrgSubscriptionQueries = useQueries({
    queries: ownedOrgs.map((membership) => ({
      queryKey: queryKeys.organizations.subscription(membership.org.id),
      queryFn: () => organizationApi.getOrganizationSubscription(membership.org.id),
      staleTime: CACHE_TIMES.SUBSCRIPTIONS,
      enabled: Boolean(membership.org.id),
    })),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; phoneNumber?: string }) => userApi.updateMe(data),
    onSuccess: (updated) =>
    {
      setUser(updated);
      toast.success(t('account.updated'));
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadProfilePicture(file),
    onSuccess: (updated) =>
    {
      setUser(updated);
      toast.success(t('account.profilePictureUpdated'));
    },
  });

  if (!currentUser)
  {
    return null;
  }

  const userFullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();

  const subscriptionByOrgId = useMemo(() =>
  {
    const map = new Map<string, Subscription>();
    for (let i = 0; i < ownedOrgs.length; i++)
    {
      const orgId = ownedOrgs[i]?.org?.id;
      const data = ownedOrgSubscriptionQueries[i]?.data;
      if (orgId && data)
      {
        map.set(orgId, data);
      }
    }
    return map;
  }, [ownedOrgs, ownedOrgSubscriptionQueries]);

  const ownedOrgStatusBuckets = useMemo(() =>
  {
    const active: OrganizationMembership[] = [];
    const trialing: Array<{ membership: OrganizationMembership; subscription: Subscription; daysLeft: number | null }> = [];
    const inactive: OrganizationMembership[] = [];

    const now = Date.now();

    const isInactive = (status: SubscriptionStatus) =>
    {
      return status !== 'ACTIVE' && status !== 'TRIALING';
    };

    for (const membership of ownedOrgs)
    {
      const sub = subscriptionByOrgId.get(membership.org.id);
      if (!sub)
      {
        // If we can't load subscription yet, treat as inactive/unknown for now.
        inactive.push(membership);
        continue;
      }

      if (sub.status === 'ACTIVE')
      {
        active.push(membership);
        continue;
      }

      if (sub.status === 'TRIALING')
      {
        const end = new Date(sub.nextBillingDate).getTime();
        const diffMs = end - now;
        const daysLeft = Number.isFinite(end) ? Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000))) : null;
        trialing.push({ membership, subscription: sub, daysLeft });
        continue;
      }

      if (isInactive(sub.status))
      {
        inactive.push(membership);
      }
    }

    return { active, trialing, inactive };
  }, [ownedOrgs, subscriptionByOrgId]);

  const handlePickAvatar = () =>
  {
    fileInputRef.current?.click();
  };

  const handleAvatarFile = async (file: File | null) =>
  {
    if (!file) return;

    setIsUploadingAvatar(true);
    try
    {
      await uploadProfilePictureMutation.mutateAsync(file);
    }
    finally
    {
      setIsUploadingAvatar(false);
    }
  };

  const validateFullName = (value: string): string | undefined =>
  {
    const trimmed = value.trim();
    if (!trimmed) return t('validation.required');
    if (!trimmed.includes(' ')) return t('account.fullNameMustIncludeLastName');
    return undefined;
  };

  const saveFullName = async (fullName: string) =>
  {
    const trimmed = fullName.trim().replace(/\s+/g, ' ');
    const firstSpace = trimmed.indexOf(' ');
    const firstName = trimmed.slice(0, firstSpace);
    const lastName = trimmed.slice(firstSpace + 1);
    await updateProfileMutation.mutateAsync({ firstName, lastName });
  };

  const savePhone = async (phoneNumber: string) =>
  {
    // Allow clearing by submitting an empty value
    await updateProfileMutation.mutateAsync({ phoneNumber: phoneNumber.trim() });
  };

  return (
    <PageContainer>
      <Section>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Personal info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('account.title')}</CardTitle>
              <CardDescription>{t('account.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Stack direction="horizontal" space="md" align="center" className="justify-between">
                <Stack direction="horizontal" space="md" align="center">
                  <UserAvatar
                    user={currentUser}
                    size="lg"
                    className="h-20 w-20 text-2xl"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{userFullName}</h3>
                    <p className="text-sm text-muted-foreground">{t('account.personalInformation')}</p>
                  </div>
                </Stack>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => void handleAvatarFile(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePickAvatar}
                    disabled={isUploadingAvatar}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('account.changeProfilePicture')}
                  </Button>
                </div>
              </Stack>

              {/* Full name */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground">{t('account.fullName')}</p>
                <InlineEditField
                  value={userFullName}
                  label={t('account.fullName')}
                  onSave={saveFullName}
                  validate={validateFullName}
                  isLoading={updateProfileMutation.isPending}
                  alwaysShowEdit
                  textClassName="text-base"
                />
              </div>

              {/* Email (read-only) */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{t('account.email')}</p>
                  <p className="text-base break-all">{currentUser.email}</p>
                  {currentUser.isEmailVerified && (
                    <p className="text-xs text-success mt-1">{t('account.emailVerified')}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{t('account.phoneNumber')}</p>
                  <InlineEditField
                    value={currentUser.phoneNumber ?? ''}
                    placeholder={t('account.addPhoneNumber')}
                    label={t('account.phoneNumber')}
                    onSave={savePhone}
                    isLoading={updateProfileMutation.isPending}
                    alwaysShowEdit
                    textClassName="text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owned organizations summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('account.ownedOrganizations.title')}</CardTitle>
              <CardDescription>{t('account.ownedOrganizations.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ownedOrgsQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t('account.ownedOrganizations.count', { count: ownedOrgs.length })}
                  </p>

                  <div className="space-y-2">
                    <p className="text-sm">
                      {t('account.ownedOrganizations.activeCount', { count: ownedOrgStatusBuckets.active.length })}
                    </p>
                    <p className="text-sm">
                      {t('account.ownedOrganizations.trialCount', { count: ownedOrgStatusBuckets.trialing.length })}
                    </p>
                    {ownedOrgStatusBuckets.trialing.length > 0 && (
                      <div className="pl-3 space-y-1">
                        {ownedOrgStatusBuckets.trialing.map(({ membership, daysLeft }) => (
                          <p key={membership.org.id} className="text-sm text-muted-foreground">
                            {membership.org.name}{' '}
                            {daysLeft === null
                              ? `(${t('account.ownedOrganizations.trialExpiresUnknown')})`
                              : `(${t('account.ownedOrganizations.trialExpiresInDays', { days: daysLeft })})`}
                          </p>
                        ))}
                      </div>
                    )}

                    <p className="text-sm">
                      {t('account.ownedOrganizations.inactiveCount', { count: ownedOrgStatusBuckets.inactive.length })}
                    </p>
                    {ownedOrgStatusBuckets.inactive.length > 0 && (
                      <div className="pl-3 space-y-1">
                        {ownedOrgStatusBuckets.inactive.map((membership) => (
                          <p key={membership.org.id} className="text-sm text-muted-foreground">
                            {membership.org.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {ownedOrgSubscriptionQueries.some((q) => q.isLoading) && (
                    <p className="text-xs text-muted-foreground">
                      {t('common.loading')}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Section>
    </PageContainer>
  );
}
