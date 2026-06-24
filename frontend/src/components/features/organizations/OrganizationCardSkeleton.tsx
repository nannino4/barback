import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Stack } from '@/components/layout';

/**
 * OrganizationCardSkeleton - Loading state for OrganizationCard
 * 
 * Matches the structure of OrganizationCard:
 * - Icon placeholder (12x12 rounded)
 * - Name + role badge inline
 * - Owner info below
 * - Chevron on the right
 */
export const OrganizationCardSkeleton: React.FC = () =>
{
  return (
    <Card>
      <CardContent>
        <Stack direction="horizontal" space="md" align="center">
          {/* Icon skeleton */}
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />

          {/* Info skeleton */}
          <Stack space="xs" className="flex-1 min-w-0">
            <Stack direction="horizontal" space="sm" align="center">
              {/* Name skeleton */}
              <Skeleton className="h-5 w-32" />
              {/* Role badge skeleton */}
              <Skeleton className="h-4 w-14 rounded-md" />
            </Stack>
            {/* Owner info skeleton */}
            <Stack direction="horizontal" space="sm" align="center">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </Stack>
          </Stack>

          {/* Chevron skeleton */}
          <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
        </Stack>
      </CardContent>
    </Card>
  );
};
