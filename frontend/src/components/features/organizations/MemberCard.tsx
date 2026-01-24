import React from 'react';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stack } from '@/components/layout';
import { OrgRoleBadge } from '@/components/features/organizations/OrgRoleBadge';
import { UserInfo } from '@/components/user';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import type { OrganizationMembershipResponse } from '@/types/organization';

interface MemberCardProps
{
  member: OrganizationMembershipResponse;
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

  return (
    <Card
      variant="bordered"
      className={cn(isRemoving && 'opacity-70')}
    >
      <CardContent>
        <Stack direction="horizontal" space="md" align="center" className="gap-4">
          {/* Member info */}
          <Stack space="md" className="flex-1 min-w-0">
            <OrgRoleBadge role={member.role} />

            <Stack space="xs">
              <Stack direction="horizontal" space="sm" align="center" className="flex-wrap">
                <UserInfo
                  user={member.user}
                  size="md"
                />
                {isSelf && (
                  <span className="text-xs text-muted-foreground">({t('common.you')})</span>
                )}
              </Stack>
            </Stack>
          </Stack>

          {/* Remove button */}
          {canRemove && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onRemove(member.user.id)}
              disabled={isRemoving}
              className="flex-shrink-0"
              aria-label={t('members.remove.removeMember')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
