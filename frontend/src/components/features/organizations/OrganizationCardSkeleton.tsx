import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * OrganizationCardSkeleton - Loading state for OrganizationCard
 * 
 * Matches the structure of OrganizationCard:
 * - Icon + Title + Description in header
 * - Role badge on the right
 * - Action button in content
 */
export const OrganizationCardSkeleton: React.FC = () =>
{
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon skeleton */}
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title skeleton */}
              <Skeleton className="h-5 w-3/4" />
              {/* Description skeleton */}
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          {/* Badge skeleton */}
          <Skeleton className="w-16 h-6 rounded-full flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Button skeleton */}
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
};
