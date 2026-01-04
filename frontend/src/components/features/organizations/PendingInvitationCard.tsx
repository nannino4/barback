import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { OrgRoleBadge } from '@/components/features/organizations/OrgRoleBadge';
import { UserInfo } from '@/components/user';
import { useI18n } from '@/hooks/useI18n';
import type { Invitation } from '@/types/invitation';

interface PendingInvitationCardProps
{
  invitation: Invitation;
  onRevoke: (invitationId: string) => void;
  isRevoking?: boolean;
}

/**
 * PendingInvitationCard - Display pending invitation with revoke action
 * 
 * Features:
 * - Invited email and role
 * - Inviter information
 * - Sent date and expiry date
 * - Expired indicator
 * - Revoke button (owner/manager)
 */
export const PendingInvitationCard: React.FC<PendingInvitationCardProps> = ({
  invitation,
  onRevoke,
  isRevoking = false,
}) =>
{
  const { t } = useI18n();

  const expiresAt = new Date(invitation.expiresAt);
  const isExpired = expiresAt < new Date();
  const daysUntilExpiration = Math.max(
    0,
    Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  if (isExpired)
  {
    return null;
  }

  return (
    <Card variant="bordered">
      <CardContent>
        <Stack space="md">
          {/* Header */}
          <Stack direction="vertical" justify="between" align="start">
            <Stack space="sm" className="flex-1 min-w-0">
              <OrgRoleBadge role={invitation.role}/>
              <span className="font-semibold text-base truncate">
                {invitation.invitedEmail}
              </span>
              <Stack direction='horizontal' space='sm'>
                <span className="text-sm text-muted-foreground">
                  {t('invitations.invitedBy')}
                </span>
                <UserInfo
                  user={invitation.invitedBy}
                  size="sm"
                  className="text-muted-foreground"
                />
              </Stack>
            </Stack>

            {/* Expiration */}
            <Stack direction="horizontal" space="xs" align="center" className="text-sm text-muted-foreground">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{t('invitations.expiresIn', { count: daysUntilExpiration })}</span>
            </Stack>
          </Stack>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevoke(invitation.id)}
            disabled={isRevoking}
            className="w-full sm:w-auto text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            {isRevoking ? t('invitations.revoke.revoking') : t('invitations.revoke.button')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
