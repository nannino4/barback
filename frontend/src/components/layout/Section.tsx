import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps
{
  children: React.ReactNode;
  className?: string;
  /**
   * Spacing size - controls vertical margin between sections
   * @default 'md'
   */
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Section - Provides consistent vertical spacing between page sections
 * 
 * Usage:
 * ```tsx
 * <Section>
 *   <h2>Section Title</h2>
 *   <Stack space="sm">
 *     <Card>Content 1</Card>
 *     <Card>Content 2</Card>
 *   </Stack>
 * </Section>
 * 
 * <Section spacing="lg">
 *   <h2>Next Section</h2>
 * </Section>
 * ```
 * 
 * Spacing Scale:
 * - sm: 1rem (16px)
 * - md: 1.5rem (24px) - default
 * - lg: 2rem (32px)
 * - xl: 3rem (48px)
 */
export const Section: React.FC<SectionProps> = ({
  children,
  className,
  spacing = 'md',
}) =>
{
  const spacingClasses = {
    sm: 'mb-4',
    md: 'mb-6',
    lg: 'mb-8',
    xl: 'mb-12',
  };

  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  );
};
