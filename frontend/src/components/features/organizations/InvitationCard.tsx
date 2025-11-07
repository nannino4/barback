import React from 'react';
import { Mail, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onAccept,
  onDecline,
  isAccepting = false,
  isDeclining = false,
}) =>
{
  const { t } = useI18n();
  
  const getRoleBadgeVariant = (role: string) =>
  {
    switch (role)
    {
    case 'OWNER':
      return 'default';
    case 'MANAGER':
      return 'secondary';
    case 'STAFF':
      return 'outline';
    default:
      return 'outline';
    }
  };

  const getRoleLabel = (role: string) =>
  {
    const roleKey = role.toLowerCase() as 'owner' | 'manager' | 'staff';
    return t(`organizations.role.${roleKey}`);
  };

  const formatDate = (dateString: string) =>
  {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = invitation.expiresAt && new Date(invitation.expiresAt) < new Date();
  const inviterName = `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`;

  return (
    <Card
      className={cn(
        'transition-all',
        isExpired && 'opacity-60 border-destructive/50',
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {invitation.organization.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('invitations.invitedBy', { name: inviterName })}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={getRoleBadgeVariant(invitation.role)}
            className={cn(
              'flex-shrink-0',
              invitation.role === 'OWNER' && 'bg-primary text-primary-foreground',
            )}
          >
            {getRoleLabel(invitation.role)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dates */}
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          {invitation.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {t('invitations.created', { date: formatDate(invitation.createdAt) })}
              </span>
            </div>
          )}
          {invitation.expiresAt && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className={cn(isExpired && 'text-destructive font-medium')}>
                {isExpired
                  ? t('invitations.expired')
                  : t('invitations.expires', { date: formatDate(invitation.expiresAt) })
                }
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onAccept(invitation.id)}
            disabled={isExpired || isAccepting || isDeclining}
            className="flex-1"
            variant="default"
          >
            {isAccepting ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {t('invitations.accepting')}
              </span>
            ) : (
              t('invitations.acceptButton')
            )}
          </Button>
          <Button
            onClick={() => onDecline(invitation.id)}
            disabled={isExpired || isAccepting || isDeclining}
            className="flex-1"
            variant="outline"
          >
            {isDeclining ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {t('invitations.declining')}
              </span>
            ) : (
              t('invitations.declineButton')
            )}
          </Button>
        </div>

        {isExpired && (
          <p className="text-xs text-destructive text-center pt-1">
            {t('invitations.expiredMessage')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
