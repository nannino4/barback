import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Stack } from '@/components/layout';

/**
 * MemberCardSkeleton - Loading state for MemberCard
 * 
 * Matches the structure of MemberCard:
 * - Avatar placeholder
 * - Name and email placeholders
 * - Role badge placeholder
 * - Optional action button placeholder
 */
export const MemberCardSkeleton: React.FC<{ showAction?: boolean }> = ({ 
  showAction = false,
}) =>
{
  return (
    <Card>
      <CardContent>
        <Stack direction="horizontal" space="md" align="center" className="gap-4">
          {/* Avatar skeleton */}
          <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />

          {/* Member info skeleton */}
          <Stack space="sm" className="flex-1 min-w-0">
            {/* Role badge skeleton */}
            <Skeleton className="h-4 w-16 rounded-md" />
            <Stack space="xs">
              {/* Name skeleton */}
              <Skeleton className="h-5 w-32" />
              {/* Email skeleton */}
              <Stack direction="horizontal" space="xs" align="center">
                <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 w-40" />
              </Stack>
            </Stack>
          </Stack>

          {/* Action button skeleton */}
          {showAction && <Skeleton className="h-8 w-20 rounded-md flex-shrink-0" />}
        </Stack>
      </CardContent>
    </Card>
  );
};
