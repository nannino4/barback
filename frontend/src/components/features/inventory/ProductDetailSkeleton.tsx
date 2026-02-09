import React from 'react';
import { PageContainer, Stack, Grid, Section } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductDetailSkeleton: React.FC = () =>
{
  const logSkeletons = React.useMemo(() => ['log-1', 'log-2', 'log-3'], []);

  return (
    <PageContainer>
      <Stack space="lg">
        <Stack direction="horizontal" align="center" justify="between">
          <Stack direction="horizontal" align="center" space="sm">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Stack space="xs">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </Stack>
          </Stack>
          <Skeleton className="h-10 w-24 rounded-md" />
        </Stack>

        <Section>
          <Grid cols={{ mobile: 1, tablet: 2, desktop: 2 }} gap="lg">
            <Card>
              <Stack space="md">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Stack space="sm">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </Stack>
                <Stack space="sm">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </Stack>
              </Stack>
            </Card>

            <Card>
              <Stack space="md">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-10 w-full rounded-md" />
              </Stack>
            </Card>
          </Grid>
        </Section>

        <Section spacing="lg">
          <Card>
            <Stack space="md">
              <Skeleton className="h-5 w-40" />
              <Stack space="sm">
                {logSkeletons.map((key) => (
                  <Skeleton key={key} className="h-14 w-full rounded-lg" />
                ))}
              </Stack>
            </Stack>
          </Card>
        </Section>
      </Stack>
    </PageContainer>
  );
};
