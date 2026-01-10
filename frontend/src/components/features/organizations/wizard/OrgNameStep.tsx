import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { organizationApi } from '@/api/organization-api';
import type { CreateOrganizationFormData } from '@/types/organization';

interface OrgNameStepProps
{
  onNext: () => void;
}

/**
 * OrgNameStep - First step of organization creation wizard
 * 
 * Validates organization name with real-time availability check
 * Uses debounced API validation to prevent excessive requests
 */
export const OrgNameStep: React.FC<OrgNameStepProps> = ({ onNext }) =>
{
  const { t } = useI18n();
  const form = useFormContext<CreateOrganizationFormData>();
  const [debouncedName, setDebouncedName] = useState('');
  
  const watchedName = form.watch('name');

  // Debounce name input for validation
  useEffect(() =>
  {
    const timer = setTimeout(() =>
    {
      setDebouncedName(watchedName);
    }, 300);

    return () => clearTimeout(timer);
  }, [watchedName]);

  // Name validation mutation
  const validateNameMutation = useMutation({
    mutationFn: (name: string) => organizationApi.validateOrgName(name),
  });

  // Validate name when debounced value changes
  useEffect(() =>
  {
    const eligible = debouncedName && debouncedName.length >= 2;
    if (eligible)
    {
      // Clear previous result so UI doesn't show stale availability during a new check
      validateNameMutation.reset();
      validateNameMutation.mutate(debouncedName);
    }
    else
    {
      validateNameMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);

  const onSubmit = async (data: CreateOrganizationFormData): Promise<void> =>
  {
    try
    {
      const result = await organizationApi.validateOrgName(data.name);
      if (!result.available)
      {
        form.setError('name', {
          type: 'manual',
          message: t('organizations.create.nameStep.nameUnavailable'),
        });
        return;
      }

      onNext();
    }
    catch
    {
      form.setError('name', {
        type: 'manual',
        message: t('errors.genericError'),
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) =>
  {
    e.preventDefault();
    void form.handleSubmit(onSubmit)(e);
  };

  // Derived UI state
  const nameError = form.formState.errors.name;
  const eligible = !!watchedName && watchedName.length >= 2 && !nameError;
  const isDebouncing = eligible && debouncedName !== watchedName;
  const isPending = validateNameMutation.isPending;
  const available = validateNameMutation.data?.available;

  type Status = 'idle' | 'checking' | 'available' | 'unavailable';
  const status: Status =
    !eligible
      ? 'idle'
      : (isDebouncing || isPending)
        ? 'checking'
        : available === true
          ? 'available'
          : available === false
            ? 'unavailable'
            : 'idle';

  const disableContinue =
    !eligible ||
    status === 'checking' ||
    status === 'unavailable';

  return (
    <Stack space="lg">
      <p className="text-muted-foreground">
        {t('organizations.create.nameStep.description')}
      </p>

      <form onSubmit={handleFormSubmit} noValidate>
        <Stack space="md">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('organizations.create.nameStep.nameLabel')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('organizations.create.nameStep.namePlaceholder')}
                    {...field}
                    autoFocus
                  />
                </FormControl>
                
                {/* Validation feedback - fixed-size container to prevent layout shift */}
                <div
                  className="w-full min-h-6 grid"
                  aria-live="polite"
                  role="status"
                  aria-busy={status === 'checking'}
                >
                  {/* Checking */}
                  <div
                    className={`col-start-1 row-start-1 flex items-center gap-2 text-sm text-muted-foreground transition-opacity duration-150 ${
                      status === 'checking' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('organizations.create.nameStep.checkingAvailability')}</span>
                  </div>

                  {/* Available */}
                  <div
                    className={`col-start-1 row-start-1 flex items-center gap-2 text-sm text-success transition-opacity duration-150 ${
                      status === 'available' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t('organizations.create.nameStep.nameAvailable')}</span>
                  </div>

                  {/* Unavailable */}
                  <div
                    className={`col-start-1 row-start-1 flex items-center gap-2 text-sm text-destructive transition-opacity duration-150 ${
                      status === 'unavailable' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    <span>{t('organizations.create.nameStep.nameUnavailable')}</span>
                  </div>
                </div>
                
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={disableContinue}
          >
            {t('common.continue')}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};
