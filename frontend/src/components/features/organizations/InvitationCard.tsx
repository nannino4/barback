import React from 'react';
import { Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InlineSpinner } from '@/components/ui/spinner';
import { Stack } from '@/components/layout';
import { UserInfo } from '@/components/user';
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

  if (isExpired)
  {
    return null;
  }

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
        isProcessing && 'opacity-70',
      )}
    >
      <CardContent>
        <Stack space="md">
          {/* Header: Icon + Info */}
          <Stack direction="horizontal" space="md" align="center">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors flex-shrink-0',
                'bg-primary/10 text-primary',
              )}
            >
              <Building2 className="w-6 h-6" />
            </div>

            <Stack space="sm" className="flex-1 min-w-0">
              <OrgRoleBadge role={invitation.role} size="sm" />
              <span className="font-semibold text-base truncate">
                {invitation.organization.name}
              </span>
              <Stack direction='horizontal' space='sm'>
                <span className="text-sm text-muted-foreground">
                  {t('invitations.invitedBy')}
                </span>
                <UserInfo
                  user={invitation.organization.owner}
                  size="sm"
                  className="text-muted-foreground"
                />
              </Stack>
            </Stack>
          </Stack>

          {/* Actions */}
          <Stack direction="horizontal" space="sm" className="w-full">
            <Button
              onClick={handleAccept}
              disabled={isProcessing}
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
              disabled={isProcessing}
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
        </Stack>
      </CardContent>
    </Card>
  );
};
