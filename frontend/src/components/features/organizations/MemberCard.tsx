import React from 'react';
import { User, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { OrgRoleBadge } from '@/components/features/organizations/OrgRoleBadge';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import type { OrganizationMembership } from '@/types/organization';

interface MemberCardProps
{
  member: OrganizationMembership;
  currentUserId: string;
  isOwner: boolean; // Is the viewing user the owner?
  onRemove?: (userId: string) => void;
  isRemoving?: boolean;
}

/**
 * MemberCard - Display organization member with role badge and actions
 * 
 * Features:
 * - User info (name, email, profile picture)
 * - Role badge with icon
 * - Remove button (owner only, cannot remove self)
 */
export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  currentUserId,
  isOwner,
  onRemove,
  isRemoving = false,
}) =>
{
  const { t } = useI18n();
  const isSelf = member.user.id === currentUserId;
  const canRemove = isOwner && !isSelf && onRemove;
  const fullName = `${member.user.firstName} ${member.user.lastName}`.trim();
  const displayName = fullName || member.user.email;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left section: Avatar and info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar */}
            {member.user.profilePictureUrl ? (
              <img
                src={member.user.profilePictureUrl}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                "bg-primary/10 text-primary",
              )}>
                <User className="w-6 h-6" />
              </div>
            )}

            {/* Member info */}
            <Stack space="sm" className="flex-1 min-w-0">
              <Stack space="xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">
                    {displayName}
                  </span>
                  {isSelf && (
                    <span className="text-xs text-muted-foreground">
                      ({t('common.you')})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{member.user.email}</span>
                </div>
              </Stack>

              <OrgRoleBadge role={member.role} />
            </Stack>
          </div>

          {/* Right section: Remove button */}
          {canRemove && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(member.user.id)}
              disabled={isRemoving}
            >
              {isRemoving ? t('members.remove.removing') : t('members.remove.button')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
