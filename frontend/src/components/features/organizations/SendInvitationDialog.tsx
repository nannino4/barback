import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationApi } from '@/api/invitation-api';
import toast from 'react-hot-toast';
import { ApiError, getLocalizedErrorMessage } from '@/lib/errors';
import { queryKeys } from '@/lib/queryKeys';
import type { OrgRole } from '@/types/organization';

interface SendInvitationDialogProps
{
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * SendInvitationDialog - Modal dialog for sending organization invitations
 * 
 * Features:
 * - Email input with validation
 * - Role selector (Manager, Staff)
 * - Submit button with loading state
 * - Error display (declarative)
 * - Success feedback (toast)
 * - Auto-close on success
 */
export const SendInvitationDialog: React.FC<SendInvitationDialogProps> = ({
  orgId,
  open,
  onOpenChange,
}) =>
{
  const { t } = useI18n();
  const queryClient = useQueryClient();
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MANAGER' | 'STAFF'>('STAFF');

  const sendInvitationMutation = useMutation({
    mutationFn: () => invitationApi.sendInvitation(orgId, {
      invitedEmail: email,
      role,
    }),
    onSuccess: () =>
    {
      // Invalidate queries
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.invitations(orgId) });
      
      // Show success toast
      toast.success(t('invitations.send.success'));
      
      // Reset form and close dialog
      setEmail('');
      setRole('STAFF');
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) =>
  {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.includes('@'))
    {
      return;
    }
    
    sendInvitationMutation.mutate();
  };

  const getRoleLabel = (roleValue: OrgRole): string =>
  {
    const roleKey = roleValue.toLowerCase() as 'owner' | 'manager' | 'staff';
    return t(`organizations.role.${roleKey}`);
  };

  const roleOptions: Array<'MANAGER' | 'STAFF'> = ['MANAGER', 'STAFF'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('invitations.send.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Stack space="lg">
            {/* Email Input */}
            <Stack space="sm">
              <Label htmlFor="email">{t('invitations.send.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('invitations.send.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={sendInvitationMutation.isPending}
              />
            </Stack>

            {/* Role Selector */}
            <Stack space="sm">
              <Label htmlFor="role">{t('invitations.send.roleLabel')}</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="role"
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    disabled={sendInvitationMutation.isPending}
                  >
                    {getRoleLabel(role)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {roleOptions.map((roleOption) => (
                    <DropdownMenuItem
                      key={roleOption}
                      onClick={() => setRole(roleOption)}
                      className="cursor-pointer"
                    >
                      {getRoleLabel(roleOption)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Stack>

            {/* Error Display */}
            {sendInvitationMutation.error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  {ApiError.isApiError(sendInvitationMutation.error)
                    ? getLocalizedErrorMessage(sendInvitationMutation.error, t)
                    : t('invitations.send.error')}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sendInvitationMutation.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={sendInvitationMutation.isPending || !email}
              >
                {sendInvitationMutation.isPending
                  ? t('invitations.send.sending')
                  : t('invitations.send.sendButton')}
              </Button>
            </div>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};
