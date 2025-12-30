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
      <CardContent className="p-4">
        <Stack space="md">
          {/* Header: Org icon + name + Role badge */}
          <Stack direction="horizontal" justify="between" align="start" className="gap-3">
            <Stack direction="horizontal" space="md" align="center" className="flex-1 min-w-0">
              {/* Icon skeleton */}
              <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
              <Stack space="xs" className="flex-1 min-w-0">
                {/* Name skeleton */}
                <Skeleton className="h-5 w-40" />
                {/* Owner info skeleton */}
                <Stack direction="horizontal" space="xs" align="center">
                  <Skeleton className="w-3.5 h-3.5 rounded-full flex-shrink-0" />
                  <Skeleton className="h-3.5 w-28" />
                </Stack>
              </Stack>
            </Stack>
            {/* Badge skeleton */}
            <Skeleton className="w-16 h-6 rounded-full flex-shrink-0" />
          </Stack>

          {/* Invited by skeleton */}
          <Skeleton className="h-4 w-48" />

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
