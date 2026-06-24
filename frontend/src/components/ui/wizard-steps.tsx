import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep
{
  label: string;
  isComplete: boolean;
  isCurrent: boolean;
}

interface WizardStepsProps
{
  steps: WizardStep[];
  className?: string;
}

/**
 * WizardSteps - Visual indicator for multi-step wizard progress
 * 
 * Features:
 * - Shows step numbers with visual states (pending, current, complete)
 * - Connects steps with progress lines
 * - Fully responsive with mobile-friendly spacing
 * - Accessible with proper ARIA labels
 * 
 * @example
 * ```tsx
 * <WizardSteps
 *   steps={[
 *     { label: 'Details', isComplete: true, isCurrent: false },
 *     { label: 'Plan', isComplete: false, isCurrent: true },
 *     { label: 'Payment', isComplete: false, isCurrent: false },
 *   ]}
 * />
 * ```
 */
export const WizardSteps: React.FC<WizardStepsProps> = ({ steps, className }) =>
{
  return (
    <nav
      aria-label="Progress"
      className={cn('w-full', className)}
    >
      <ol className="flex items-center w-full">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className={cn(
              'flex items-center',
              index < steps.length - 1 ? 'flex-1' : 'flex-initial',
            )}
          >
            <div className="flex flex-col items-center gap-2">
              {/* Step Circle */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                  'sm:w-12 sm:h-12',
                  step.isComplete && 'border-primary bg-primary text-primary-foreground',
                  step.isCurrent && 'border-primary bg-background text-primary',
                  !step.isComplete && !step.isCurrent && 'border-border bg-background text-muted-foreground',
                )}
                aria-current={step.isCurrent ? 'step' : undefined}
              >
                {step.isComplete ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                ) : (
                  <span className="text-sm sm:text-base font-semibold">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  'text-xs sm:text-sm font-medium text-center',
                  'max-w-[80px] sm:max-w-none',
                  step.isCurrent && 'text-foreground',
                  !step.isCurrent && 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2 sm:mx-4 transition-colors',
                  step.isComplete ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
