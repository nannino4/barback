import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';

import { authApi } from '@/api/auth-api';
import { userApi } from '@/api/user-api';
import { InlineEditField } from '@/components/forms/InlineEditField';
import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';
import { Stack } from '@/components/layout/Stack';
import { Grid } from '@/components/layout/Grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InlineSpinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useCooldown } from '@/hooks/useCooldown';
import { ROUTES } from '@/constants/routes';
import { CACHE_TIMES } from '@/constants/cacheTimes';
import { PASSWORD_RESET_COOLDOWN_MS } from '@/constants/constants';
import { queryKeys } from '@/lib/queryKeys';
import { notify } from '@/lib/notify';
import { UserAvatar } from '@/components/user/UserAvatar';
import { useAuthStore } from '@/stores/authStore';

/**
 * UserProfilePage - User account information display
 *
 * Draft placeholder for future profile management features.
 */
export function UserProfilePage()
{
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isProfilePictureOpen, setIsProfilePictureOpen] = useState(false);
  const { startCooldown } = useCooldown('password_reset_cooldown', PASSWORD_RESET_COOLDOWN_MS);

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

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; phoneNumber?: string }) => userApi.updateMe(data),
    onSuccess: (updated) =>
    {
      queryClient.setQueryData(queryKeys.users.me, updated);
      setUser(updated);
      notify.success(t('account.updated'));
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadProfilePicture(file),
    onSuccess: (updated) =>
    {
      queryClient.setQueryData(queryKeys.users.me, updated);
      setUser(updated);
      notify.success(t('account.profilePictureUpdated'));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(currentUser?.email ?? ''),
    onSuccess: () =>
    {
      startCooldown();
      void navigate(ROUTES.AUTH.FORGOT_PASSWORD_SENT, {
        state: { email: currentUser?.email ?? '' },
      });
    },
    onError: () =>
    {
      startCooldown();
      // Security: always navigate to "sent" to avoid email enumeration signals.
      void navigate(ROUTES.AUTH.FORGOT_PASSWORD_SENT, {
        state: { email: currentUser?.email ?? '' },
      });
    },
  });

  if (!currentUser)
  {
    return null;
  }

  const userFullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();

  const handlePickAvatar = () =>
  {
    fileInputRef.current?.click();
  };

  const handleAvatarFile = async (file: File | null) =>
  {
    if (!file) return;

    // Allow picking the same file again.
    if (fileInputRef.current)
    {
      fileInputRef.current.value = '';
    }

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

  const validateName = (value: string): string | undefined =>
  {
    const trimmed = value.trim();
    if (!trimmed) return t('validation.required');
    return undefined;
  };

  const saveFirstName = async (firstName: string) =>
  {
    const trimmed = firstName.trim();
    await updateProfileMutation.mutateAsync({ firstName: trimmed });
  };

  const saveLastName = async (lastName: string) =>
  {
    const trimmed = lastName.trim();
    await updateProfileMutation.mutateAsync({ lastName: trimmed });
  };

  const handleOpenProfilePicture = () =>
  {
    if (!currentUser.profilePictureUrl)
    {
      return;
    }

    setIsProfilePictureOpen(true);
  };

  const handleResetPassword = () =>
  {
    if (!currentUser.email)
    {
      return;
    }

    resetPasswordMutation.mutate();
  };

  const handleGoBack = () =>
  {
    void navigate(-1);
  };

  return (
    <PageContainer>
      <Section>

        {/* Personal info */}
        <Card>
          <CardContent>
            <Button
              type="button"
              variant="ghost"
              onClick={handleGoBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
            <Stack space='lg'>
              <Stack align="center">
                <div className="relative">
                  <button
                    type="button"
                    className="rounded-full focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-[3px]"
                    onClick={handleOpenProfilePicture}
                    aria-label={t('account.openProfilePicture')}
                    disabled={!currentUser.profilePictureUrl}
                  >
                    <UserAvatar
                      user={currentUser}
                      size="xl"
                    />
                  </button>

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
                    size="icon"
                    className="absolute -bottom-1 -right-1 size-9 rounded-full"
                    onClick={handlePickAvatar}
                    disabled={isUploadingAvatar}
                    aria-label={t('account.changeProfilePicture')}
                  >
                    {isUploadingAvatar ? (
                      <InlineSpinner />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </Stack>

              <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }} gap="md">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('common.firstName')}</p>
                  <InlineEditField
                    value={currentUser.firstName}
                    label={t('common.firstName')}
                    onSave={saveFirstName}
                    validate={validateName}
                    isLoading={updateProfileMutation.isPending}
                    alwaysShowEdit
                    textClassName="text-base"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('common.lastName')}</p>
                  <InlineEditField
                    value={currentUser.lastName}
                    label={t('common.lastName')}
                    onSave={saveLastName}
                    validate={validateName}
                    isLoading={updateProfileMutation.isPending}
                    alwaysShowEdit
                    textClassName="text-base"
                  />
                </div>
              </Grid>

              {/* Email (read-only) */}
              <div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{t('account.email')}</p>
                  <p className="text-base break-all">{currentUser.email}</p>
                </div>
              </div>

              {/* Password reset */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetPassword}
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending && (
                    <InlineSpinner className="mr-2" />
                  )}
                  {resetPasswordMutation.isPending
                    ? t('account.resetPassword.sending')
                    : t('account.resetPassword.button')}
                </Button>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </Section>

      <Dialog open={isProfilePictureOpen} onOpenChange={setIsProfilePictureOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {currentUser.profilePictureUrl && (
            <div>
              <img
                src={currentUser.profilePictureUrl}
                alt={userFullName}
                className="w-full max-h-[70vh] object-contain rounded-lg border border-border"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
