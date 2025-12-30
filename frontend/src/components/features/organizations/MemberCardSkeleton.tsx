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
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left section: Avatar and info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar skeleton */}
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />

            {/* Member info skeleton */}
            <Stack space="sm" className="flex-1 min-w-0">
              <Stack space="xs">
                {/* Name skeleton */}
                <Skeleton className="h-5 w-32" />
                {/* Email skeleton */}
                <div className="flex items-center gap-1.5">
                  <Skeleton className="w-3.5 h-3.5 rounded-full flex-shrink-0" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </Stack>

              {/* Role badge skeleton */}
              <Skeleton className="w-16 h-6 rounded-full" />
            </Stack>
          </div>

          {/* Right section: Action button skeleton */}
          {showAction && (
            <Skeleton className="h-8 w-20 rounded-md flex-shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
