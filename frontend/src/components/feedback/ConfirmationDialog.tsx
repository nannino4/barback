import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InlineSpinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type ConfirmationVariant = 'destructive' | 'warning' | 'info';

interface ConfirmationDialogProps
{
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Confirm button label */
  confirmLabel: string;
  /** Cancel button label */
  cancelLabel: string;
  /** Callback when confirm button is clicked */
  onConfirm: () => void;
  /** Callback when cancel button is clicked (defaults to closing dialog) */
  onCancel?: () => void;
  /** Whether the action is in progress */
  isLoading?: boolean;
  /** Visual variant affecting icon and button colors */
  variant?: ConfirmationVariant;
  /** Additional content to render in the dialog body */
  children?: React.ReactNode;
}

/**
 * ConfirmationDialog - Reusable confirmation dialog for actions requiring user confirmation
 * 
 * Use cases:
 * - Destructive actions: Leave organization, remove member, delete item
 * - Warning actions: Cancel subscription, reset settings
 * - Info confirmations: Transfer ownership, change plan
 * 
 * Features:
 * - Variant-based styling (destructive, warning, info)
 * - Loading state for async actions
 * - Accessible with proper focus management
 * - Customizable labels and content
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'destructive',
  children,
}) =>
{
  const handleCancel = () =>
  {
    if (onCancel)
    {
      onCancel();
    }
    else
    {
      onOpenChange(false);
    }
  };

  const handleConfirm = () =>
  {
    onConfirm();
  };

  const IconComponent = {
    destructive: AlertTriangle,
    warning: AlertCircle,
    info: Info,
  }[variant];

  const iconColorClass = {
    destructive: 'text-destructive',
    warning: 'text-warning',
    info: 'text-info',
  }[variant];

  const iconBgClass = {
    destructive: 'bg-destructive/10',
    warning: 'bg-warning/10',
    info: 'bg-info/10',
  }[variant];

  const confirmButtonVariant = variant === 'destructive' ? 'destructive' : 'default';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              iconBgClass,
            )}>
              <IconComponent className={cn('h-5 w-5', iconColorClass)} />
            </div>
            <div className="flex-1 space-y-1.5">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {children && (
          <div className="py-2">
            {children}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <InlineSpinner />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
