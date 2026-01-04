import React from 'react';
import { Mail } from 'lucide-react';

import { useInvitations } from '@/hooks/useInvitations';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';

type InvitationsBadgeProps = {
  className?: string;
  showIcon?: boolean;
  display?: 'count' | 'dot';
  maxCount?: number;
};

export const InvitationsBadge: React.FC<InvitationsBadgeProps> = ({
  className,
  showIcon = false,
  display = 'count',
  maxCount = 99,
}) =>
{
  const { t } = useI18n();
  const { pendingInvitations } = useInvitations();
  const count = pendingInvitations.length;

  if (count <= 0) return null;

  const ariaLabel = t('invitations.pendingCount', { count });

  if (display === 'dot')
  {
    return (
      <span
        aria-label={ariaLabel}
        className={cn(
          'inline-block size-2 rounded-full bg-primary ring-2 ring-background',
          className,
        )}
      />
    );
  }

  const displayCount = count > maxCount ? `${maxCount}+` : `${count}`;

  return (
    <Badge
      aria-label={ariaLabel}
      variant="default"
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-bold',
        className,
      )}
    >
      {showIcon && (
        <Icon mode="inline" size="xs" variant="transparent" className="text-inherit">
          <Mail />
        </Icon>
      )}
      {displayCount}
    </Badge>
  );
};
