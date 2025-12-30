import React from 'react';
import { Mail, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { OrgRoleBadge } from '@/components/features/organizations/OrgRoleBadge';
import { useI18n } from '@/hooks/useI18n';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';
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
  const { t, currentLanguage } = useI18n();

  const inviterName = `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`.trim();
  const displayInviterName = inviterName || invitation.invitedBy.email;

  const isExpired = new Date(invitation.expiresAt) < new Date();

  return (
    <Card className={cn(isExpired && 'opacity-60 border-destructive/20')}>
      <CardContent className="p-4">
        <Stack space="md">
          {/* Header: Email + Role Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold truncate">{invitation.invitedEmail}</span>
            </div>
            <OrgRoleBadge role={invitation.role} />
          </div>

          {/* Inviter Info */}
          <div className="text-sm text-muted-foreground">
            {t('invitations.invitedBy', { name: displayInviterName })}
          </div>

          {/* Dates */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{t('invitations.created', { date: formatDate(invitation.createdAt, currentLanguage) })}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className={cn(
              'flex items-center gap-1.5',
              isExpired && 'text-destructive',
            )}>
              {isExpired ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <Clock className="w-4 h-4 flex-shrink-0" />
              )}
              <span>
                {isExpired
                  ? t('invitations.expired')
                  : t('invitations.expires', { date: formatDate(invitation.expiresAt, currentLanguage) })
                }
              </span>
            </div>
          </div>

          {/* Expired Message */}
          {isExpired && (
            <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                {t('invitations.expiredMessage')}
              </p>
            </div>
          )}

          {/* Revoke Button */}
          {!isExpired && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRevoke(invitation.id)}
              disabled={isRevoking}
              className="w-full sm:w-auto text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              {isRevoking ? t('invitations.revoke.revoking') : t('invitations.revoke.button')}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
