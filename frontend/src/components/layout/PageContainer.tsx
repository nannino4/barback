import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps
{
  children: React.ReactNode;
  className?: string;
}

/**
 * PageContainer - Provides consistent page-level padding and max-width
 * 
 * Usage:
 * ```tsx
 * <PageContainer>
 *   <h1>Page Title</h1>
 *   <Section>Content here</Section>
 * </PageContainer>
 * ```
 * 
 * Features:
 * - Mobile-first responsive padding
 * - Consistent max-width for readability
 * - Automatic horizontal centering
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
}) =>
{
  return (
    <div
      className={cn(
        // Mobile-first padding: 16px (p-4) on mobile, 24px (p-6) on larger screens
        'px-4 py-6 sm:p-6',
        // Max width for optimal readability on large screens
        'max-w-screen xl:max-w-7xl mx-auto',
        className,
      )}
    >
      {children}
    </div>
  );
};
