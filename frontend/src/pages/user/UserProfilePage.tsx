import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Mail, Pencil } from 'lucide-react';

import { authApi } from '@/api/auth-api';
import { userApi } from '@/api/user-api';
import { InlineEditField } from '@/components/forms/InlineEditField';
import { PageContainer } from '@/components/layout/PageContainer';
import { Section } from '@/components/layout/Section';
import { Stack } from '@/components/layout/Stack';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InlineSpinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { ROUTES } from '@/constants/routes';
import { CACHE_TIMES } from '@/constants/cacheTimes';
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
      void navigate(ROUTES.AUTH.FORGOT_PASSWORD_SENT, {
        state: { email: currentUser?.email ?? '' },
      });
    },
    onError: () =>
    {
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
                        size="lg"
                        className="h-20 w-20 text-2xl"
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

                  <div>
                    <h3 className="text-xl font-semibold">{userFullName}</h3>
                    <p className="text-sm text-muted-foreground">{t('account.personalInformation')}</p>
                  </div>
                </Stack>
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

              {/* Password reset */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground">{t('account.resetPassword.title')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('account.resetPassword.description')}</p>
                <div className="mt-3">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Dialog open={isProfilePictureOpen} onOpenChange={setIsProfilePictureOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{t('account.profilePictureDialog.title')}</DialogTitle>
            <DialogDescription>{t('account.profilePictureDialog.description')}</DialogDescription>
          </DialogHeader>

          {currentUser.profilePictureUrl && (
            <div className="p-6 pt-0">
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
