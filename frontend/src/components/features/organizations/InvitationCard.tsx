import React from 'react';
import { Building2, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineSpinner } from '@/components/ui/spinner';
import { Stack } from '@/components/layout';
import { OrgRoleBadge } from './OrgRoleBadge';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import type { Invitation } from '@/types/invitation';

interface InvitationCardProps
{
  invitation: Invitation;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
}

/**
 * InvitationCard - Displays a pending invitation with accept/decline actions
 */
export const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onAccept,
  onDecline,
  isAccepting = false,
  isDeclining = false,
}) =>
{
  const { t } = useI18n();

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isProcessing = isAccepting || isDeclining;
  const ownerName = `${invitation.organization.owner.firstName} ${invitation.organization.owner.lastName}`.trim();

  const handleAccept = (e: React.MouseEvent) =>
  {
    e.stopPropagation();
    if (!isExpired && !isProcessing)
    {
      onAccept(invitation.id);
    }
  };

  const handleDecline = (e: React.MouseEvent) =>
  {
    e.stopPropagation();
    if (!isExpired && !isProcessing)
    {
      onDecline(invitation.id);
    }
  };

  return (
    <Card 
      className={cn(
        'transition-all',
        isExpired && 'opacity-60 border-destructive/30',
        isProcessing && 'opacity-70',
      )}
    >
      <CardContent className="p-4">
        <Stack space="md">
          {/* Header: Org name + Role badge */}
          <Stack direction="horizontal" justify="between" align="start" className="gap-3">
            <Stack direction="horizontal" space="md" align="center" className="flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <Stack space="xs" className="flex-1 min-w-0">
                <span className="font-semibold truncate">
                  {invitation.organization.name}
                </span>
                <Stack direction="horizontal" space="xs" align="center" className="text-muted-foreground">
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {ownerName || invitation.organization.owner.email}
                  </span>
                </Stack>
              </Stack>
            </Stack>
            <OrgRoleBadge role={invitation.role} />
          </Stack>

          {/* Invited by info */}
          <p className="text-sm text-muted-foreground">
            {t('invitations.invitedBy', { 
              name: `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`.trim() || invitation.invitedBy.email,
            })}
          </p>

          {/* Actions */}
          <Stack direction="horizontal" space="sm">
            <Button
              onClick={handleAccept}
              disabled={isExpired || isProcessing}
              className="flex-1"
            >
              {isAccepting ? (
                <>
                  <InlineSpinner />
                  {t('invitations.accepting')}
                </>
              ) : (
                t('invitations.acceptButton')
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={isExpired || isProcessing}
              className="flex-1"
            >
              {isDeclining ? (
                <>
                  <InlineSpinner />
                  {t('invitations.declining')}
                </>
              ) : (
                t('invitations.declineButton')
              )}
            </Button>
          </Stack>

          {/* Expired message */}
          {isExpired && (
            <p className="text-xs text-destructive text-center">
              {t('invitations.expiredMessage')}
            </p>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
