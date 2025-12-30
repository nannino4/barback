import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Stack } from '@/components/layout';

/**
 * SubscriptionCardSkeleton - Loading state for subscription card
 * 
 * Matches the structure of the subscription section in OrganizationManagePage:
 * - Header with icon, title, and status badge
 * - Status message
 * - Details grid (auto-renew, created date)
 * - Optional action button
 */
export const SubscriptionCardSkeleton: React.FC<{ showAction?: boolean }> = ({
  showAction = false,
}) =>
{
  return (
    <Card>
      <CardHeader>
        <Stack direction="horizontal" justify="between" align="center" className="flex-wrap gap-2">
          <Stack direction="horizontal" space="sm" align="center">
            {/* Icon skeleton */}
            <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
            {/* Title skeleton */}
            <Skeleton className="h-5 w-28" />
          </Stack>
          {/* Status badge skeleton */}
          <Skeleton className="w-20 h-6 rounded-full flex-shrink-0" />
        </Stack>
      </CardHeader>
      <CardContent>
        <Stack space="md">
          {/* Status message skeleton */}
          <Skeleton className="h-4 w-64" />

          {/* Details grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Action button skeleton */}
          {showAction && (
            <div className="pt-2">
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
