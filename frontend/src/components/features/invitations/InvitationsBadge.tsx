import React from 'react';
import { Mail } from 'lucide-react';

import { useInvitations } from '@/hooks/useInvitations';
import { cn } from '@/lib/utils';

type InvitationsBadgeProps = {
  className?: string;
  showIcon?: boolean;
};

export const InvitationsBadge: React.FC<InvitationsBadgeProps> = ({
  className,
  showIcon = false,
}) =>
{
  const { pendingInvitations } = useInvitations();
  const count = pendingInvitations.length;

  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full',
        className,
      )}
    >
      {showIcon && <Mail className="h-3 w-3" />}
      {count}
    </span>
  );
};
