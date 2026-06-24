import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Stack } from '@/components/layout';

/**
 * InvitationCardSkeleton - Loading state for InvitationCard
 */
export const InvitationCardSkeleton: React.FC = () =>
{
  return (
    <Card>
      <CardContent>
        <Stack space="md">
          {/* Header: Icon + Info */}
          <Stack direction="horizontal" space="md" align="center">
            <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />

            <Stack space="sm" className="flex-1 min-w-0">
              {/* Role badge skeleton */}
              <Skeleton className="h-4 w-16 rounded-md" />
              {/* Org name skeleton */}
              <Skeleton className="h-5 w-40" />
              {/* Invited by skeleton */}
              <Skeleton className="h-4 w-52" />
            </Stack>
          </Stack>

          {/* Action buttons skeleton */}
          <Stack direction="horizontal" space="sm">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 flex-1 rounded-md" />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
