import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { subscriptionApi } from '@/api/subscription-api';
import { isKnownError, getLocalizedErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import type { CreateOrganizationRequest } from '@/types/organization';

interface CreateOrganizationDialogProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateOrganizationDialog: React.FC<CreateOrganizationDialogProps> = ({
  open,
  onOpenChange,
}) =>
{
  const { t } = useI18n();
  const { createOrganization, isCreating, createError } = useOrganizations();
  
  const [organizationName, setOrganizationName] = useState('');
  const [nameError, setNameError] = useState('');
  const [step, setStep] = useState<'input' | 'creating'>('input');

  // Query to check trial eligibility
  const trialEligibilityQuery = useQuery({
    queryKey: ['trial-eligibility'],
    queryFn: () => subscriptionApi.checkTrialEligibility(),
    enabled: open, // Only run when dialog is open
    staleTime: Infinity, // Cache for the entire session
  });

  // Reset form when dialog opens/closes
  useEffect(() =>
  {
    if (!open)
    {
      setOrganizationName('');
      setNameError('');
      setStep('input');
    }
  }, [open]);

  const validateName = (name: string): boolean =>
  {
    if (!name.trim())
    {
      setNameError(t('validation.required'));
      return false;
    }
    
    if (name.length > 100)
    {
      setNameError('Organization name must be 100 characters or less');
      return false;
    }

    setNameError('');
    return true;
  };

  const handleCreate = () =>
  {
    if (!validateName(organizationName))
    {
      return;
    }

    setStep('creating');

    const orgData: Omit<CreateOrganizationRequest, 'subscriptionId'> = {
      name: organizationName.trim(),
      // Settings will use backend defaults
    };

    const subscriptionData = {
      billingInterval: 'MONTHLY' as const,
      isTrial: trialEligibilityQuery.data?.eligible ?? false,
    };

    createOrganization(
      { orgData, subscriptionData },
      {
        onSuccess: () =>
        {
          onOpenChange(false);
          // Navigation is handled by the hook after setting currentOrg
        },
        onError: () =>
        {
          setStep('input'); // Go back to input on error
        },
      },
    );
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
  {
    setOrganizationName(e.target.value);
    if (nameError)
    {
      setNameError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>{t('organizations.create.title')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('organizations.create.subscriptionNote')}
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <>
            <div className="space-y-4 py-4">
              {/* Trial Eligibility Status */}
              {trialEligibilityQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{t('organizations.create.checkingEligibility')}</span>
                </div>
              ) : trialEligibilityQuery.data?.eligible ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {t('organizations.create.trialEligible')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <XCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      {t('organizations.create.trialNotEligible')}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {createError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    {isKnownError(createError)
                      ? getLocalizedErrorMessage(createError, t)
                      : t('errors.genericError')}
                  </p>
                </div>
              )}

              {/* Organization Name Input */}
              <div className="space-y-2">
                <Label htmlFor="org-name">
                  {t('organizations.create.nameLabel')}
                </Label>
                <Input
                  id="org-name"
                  type="text"
                  placeholder={t('organizations.create.namePlaceholder')}
                  value={organizationName}
                  onChange={handleNameChange}
                  className={cn(nameError && 'border-destructive')}
                  maxLength={100}
                  autoFocus
                />
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                {t('organizations.create.cancel')}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!organizationName.trim() || isCreating || trialEligibilityQuery.isLoading}
              >
                {t('organizations.create.create')}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'creating' && (
          <div className="py-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t('organizations.create.creatingOrganization')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('common.loading')}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
