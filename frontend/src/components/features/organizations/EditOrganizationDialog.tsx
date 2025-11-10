import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Stack } from '@/components/layout';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/hooks/useI18n';
import { useOrganizations } from '@/hooks/useOrganizations';
import { getLocalizedErrorMessage, isKnownError } from '@/lib/errors';
import { EditOrganizationFormSchema } from '@/types/organization';
import type { Organization, EditOrganizationFormData } from '@/types/organization';

interface EditOrganizationDialogProps
{
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * EditOrganizationDialog - Dialog for editing organization details
 * 
 * Features:
 * - Edit organization name
 * - Change default currency
 * - Form validation with Zod
 * - Declarative error display
 * - Loading states
 * - Success toast (via hook)
 */
export const EditOrganizationDialog: React.FC<EditOrganizationDialogProps> = ({
  organization,
  open,
  onOpenChange,
}) =>
{
  const { t } = useI18n();
  const { updateOrganization, isUpdating, updateError } = useOrganizations();

  /**
   * Form setup with react-hook-form and Zod validation
   */
  const form = useForm<EditOrganizationFormData>({
    resolver: zodResolver(EditOrganizationFormSchema),
    defaultValues: {
      name: organization.name,
      defaultCurrency: organization.settings.defaultCurrency,
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = (data: EditOrganizationFormData) =>
  {
    updateOrganization(
      { orgId: organization.id, data },
      {
        onSuccess: () =>
        {
          onOpenChange(false);
          form.reset();
        },
      },
    );
  };

  /**
   * Handle dialog close
   */
  const handleClose = () =>
  {
    if (isUpdating) return; // Prevent closing while saving
    onOpenChange(false);
    form.reset(); // Reset form when closing
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('orgManagement.overview.edit.title')}</DialogTitle>
          <DialogDescription>
            {t('orgManagement.overview.detailsDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
            <Stack space="lg">
              {/* Error Display */}
              {updateError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">
                    {isKnownError(updateError)
                      ? getLocalizedErrorMessage(updateError, t)
                      : t('errors.genericError')}
                  </p>
                </div>
              )}

              {/* Organization Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('orgManagement.overview.edit.nameLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('orgManagement.overview.edit.namePlaceholder')}
                        disabled={isUpdating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Currency Field */}
              <FormField
                control={form.control}
                name="defaultCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('orgManagement.overview.edit.currencyLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="EUR"
                        maxLength={3}
                        disabled={isUpdating}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isUpdating}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="gap-2"
                >
                  {isUpdating && <Spinner size="sm" />}
                  {isUpdating
                    ? t('orgManagement.overview.edit.saving')
                    : t('orgManagement.overview.edit.saveButton')}
                </Button>
              </DialogFooter>
            </Stack>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
