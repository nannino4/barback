import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InlineSpinner } from '@/components/ui/spinner';
import { StatusMessage } from '@/components/feedback/StatusMessage';
import { Stack } from '@/components/layout';
import { useI18n } from '@/hooks/useI18n';
import { useProducts } from '@/hooks/useProducts';
import { getLocalizedErrorMessage, isKnownError } from '@/lib/errors';
import {
  StockAdjustmentFormSchema,
  STOCK_ADJUSTMENT_NOTE_MAX_LENGTH,
  type StockAdjustmentFormData,
} from '@/types/product-forms';

import type { ProductResponse } from '@/types/product';

interface StockAdjustmentSheetProps
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductResponse | null;
}

export const StockAdjustmentSheet: React.FC<StockAdjustmentSheetProps> = ({
  open,
  onOpenChange,
  product,
}) =>
{
  const { t } = useI18n();
  const {
    adjustStock,
    adjustStockError,
    isAdjusting,
    resetAdjustStockError,
  } = useProducts();

  const form = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(StockAdjustmentFormSchema),
    defaultValues: {
      quantity: '',
      type: 'PURCHASE',
      actualCount: '',
      note: '',
    },
  });

  const [lastEdited, setLastEdited] = React.useState<'quantity' | 'actualCount' | null>(null);

  const quantityInput = String(form.watch('quantity') ?? '');
  const actualCountInput = String(form.watch('actualCount') ?? '');

  const parsedQuantity = Number(quantityInput);
  const parsedActualCount = Number(actualCountInput);

  const hasQuantity = quantityInput.trim() !== '' && !Number.isNaN(parsedQuantity);
  const hasActualCount = actualCountInput.trim() !== '' && !Number.isNaN(parsedActualCount);
  const isStocktake = lastEdited === 'actualCount' && actualCountInput.trim() !== '';

  const isEmptyInput = (value: string) => value.trim() === '';
  const parseNumber = (value: string) => Number(value);

  const newQuantity = React.useMemo(() =>
  {
    if (!product)
    {
      return 0;
    }

    if (isStocktake)
    {
      return hasActualCount ? parsedActualCount : product.currentQuantity;
    }

    if (!hasQuantity)
    {
      return product.currentQuantity;
    }

    return product.currentQuantity + parsedQuantity;
  }, [hasActualCount, hasQuantity, isStocktake, parsedActualCount, parsedQuantity, product]);

  const newStockDisplayValue = React.useMemo(() =>
  {
    if (lastEdited === 'actualCount' || actualCountInput.trim() !== '')
    {
      return actualCountInput;
    }

    if (hasQuantity)
    {
      return String(newQuantity);
    }

    return String(product?.currentQuantity ?? '');
  }, [actualCountInput, hasQuantity, lastEdited, newQuantity, product?.currentQuantity]);

  const shouldSyncActualCount = lastEdited !== 'actualCount';

  const handleQuantityChange = (value: string) =>
  {
    if (!product)
    {
      return;
    }

    const numericValue = parseNumber(value);

    setLastEdited('quantity');

    if (Number.isNaN(numericValue) || isEmptyInput(value))
    {
      if (shouldSyncActualCount)
      {
        form.setValue('actualCount', '', { shouldDirty: true });
      }
      return;
    }

    if (shouldSyncActualCount)
    {
      form.setValue('actualCount', String(product.currentQuantity + numericValue), {
        shouldDirty: true,
      });
    }
  };

  const handleActualCountChange = (value: string) =>
  {
    if (!product)
    {
      return;
    }

    const numericValue = parseNumber(value);

    setLastEdited('actualCount');

    if (Number.isNaN(numericValue) || isEmptyInput(value))
    {
      form.setValue('quantity', '', { shouldDirty: true });
      return;
    }

    const delta = numericValue - product.currentQuantity;

    form.setValue('quantity', String(delta), {
      shouldDirty: true,
    });
  };

  React.useEffect(() =>
  {
    if (!open)
    {
      return;
    }

    form.reset({
      quantity: '0',
      type: 'PURCHASE',
      actualCount: String(product?.currentQuantity ?? ''),
      note: '',
    });
    setLastEdited(null);
    resetAdjustStockError();
  }, [form, open, product?.id, product?.currentQuantity, resetAdjustStockError]);

  if (!product)
  {
    return null;
  }

  const handleStepChange = (step: number) =>
  {
    const rawValue = form.getValues('quantity');
    const currentValue = Number(rawValue);
    const safeValue = Number.isNaN(currentValue) ? 0 : currentValue;
    const nextValue = safeValue + step;
    const clampedValue = isStocktake ? Math.max(0, nextValue) : nextValue;

    form.setValue('quantity', String(clampedValue), {
      shouldDirty: true,
      shouldValidate: true,
    });
    handleQuantityChange(String(clampedValue));
  };

  const validateAndSubmit = async (data: StockAdjustmentFormData) =>
  {
    const rawQuantityValue = String(data.quantity ?? '');
    const rawActualCountValue = String(data.actualCount ?? '');
    const rawQuantity = Number(rawQuantityValue);
    const rawActualCount = Number(rawActualCountValue);

    if (rawQuantityValue.trim() === '' && rawActualCountValue.trim() === '')
    {
      form.setError('quantity', {
        message: t('validation.inventory.quantity.required'),
      });
      return;
    }

    if (!product)
    {
      return;
    }

    const isStocktakeSubmit = lastEdited === 'actualCount' && !isEmptyInput(rawActualCountValue);

    if (isStocktakeSubmit)
    {
      if (Number.isNaN(rawActualCount))
      {
        form.setError('actualCount', {
          message: t('validation.inventory.quantity.invalid'),
        });
        return;
      }

      if (rawActualCount < 0)
      {
        form.setError('actualCount', {
          message: t('validation.inventory.quantity.negativeStocktake'),
        });
        return;
      }

      const delta = rawActualCount - product.currentQuantity;
      if (delta === 0)
      {
        form.setError('actualCount', {
          message: t('validation.inventory.quantity.noChange'),
        });
        return;
      }

      const note = data.note?.trim();

      try
      {
        await adjustStock({
          productId: product.id,
          data: {
            type: delta > 0 ? 'PURCHASE' : 'CONSUMPTION',
            quantity: delta,
            note: note || undefined,
          },
        });

        onOpenChange(false);
      }
      catch (error)
      {
        void error;
      }

      return;
    }

    if (Number.isNaN(rawQuantity))
    {
      form.setError('quantity', {
        message: t('validation.inventory.quantity.invalid'),
      });
      return;
    }

    if (rawQuantity === 0)
    {
      form.setError('quantity', {
        message: t('validation.inventory.quantity.nonZero'),
      });
      return;
    }

    const calculatedNewQuantity = product.currentQuantity + rawQuantity;
    if (calculatedNewQuantity < 0)
    {
      form.setError('quantity', {
        message: t('validation.inventory.quantity.negativeResult', {
          current: product.currentQuantity,
          maxReduction: product.currentQuantity,
        }),
      });
      return;
    }

    const note = data.note?.trim();

    try
    {
      await adjustStock({
        productId: product.id,
        data: {
          type: rawQuantity > 0 ? 'PURCHASE' : 'CONSUMPTION',
          quantity: rawQuantity,
          note: note || undefined,
        },
      });

      onOpenChange(false);
    }
    catch (error)
    {
      void error;
    }
  };

  const errorMessage = adjustStockError && isKnownError(adjustStockError)
    ? getLocalizedErrorMessage(adjustStockError, t)
    : adjustStockError
      ? t('inventory.adjustment.errors.saveFailed')
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl sm:max-w-xl sm:mx-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle>{t('inventory.adjustment.title')}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {product.name}
          </p>
        </SheetHeader>

        <Stack space="lg" className="mt-4">
          {/* Current stock */}
          <div className="rounded-lg border border-border bg-card p-4">
            <Stack space="xs" className="items-center text-center">
              <p className="text-sm text-muted-foreground">
                {t('inventory.adjustment.currentStock')}
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-2xl font-semibold tabular-nums">
                  {product.currentQuantity}
                </span>
                <span className="text-sm text-muted-foreground">
                  {product.defaultUnit}
                </span>
              </div>
            </Stack>
          </div>

          {errorMessage && (
            <StatusMessage
              variant="error"
              title={t('inventory.adjustment.errors.title')}
              description={errorMessage}
            />
          )}

          <Form {...form}>
            <form
              onSubmit={(event) =>
              {
                event.preventDefault();
                void form.handleSubmit(validateAndSubmit)(event);
              }}
              noValidate
            >
              <Stack space="lg">
                {/* Quantity change */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleStepChange(-1)}
                            disabled={isAdjusting}
                            className="h-16 w-16"
                            aria-label={t('inventory.adjustment.decrease')}
                          >
                            <Minus className="h-7 w-7" />
                          </Button>
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            autoFocus
                            placeholder={t('inventory.adjustment.quantityPlaceholder')}
                            value={field.value ?? ''}
                            onChange={(event) =>
                            {
                              field.onChange(event);
                              handleQuantityChange(event.target.value);
                            }}
                            disabled={isAdjusting}
                            className="h-16 text-center"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleStepChange(1)}
                            disabled={isAdjusting}
                            className="h-16 w-16"
                            aria-label={t('inventory.adjustment.increase')}
                          >
                            <Plus className="h-7 w-7" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* New stock level */}
                <FormField
                  control={form.control}
                  name="actualCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="rounded-lg border border-border bg-card p-4">
                          <Stack space="xs" className="items-center text-center">
                            <p className="text-sm text-muted-foreground">
                              {t('inventory.adjustment.newStockLevelLabel')}
                            </p>
                            <div className="flex items-baseline justify-center gap-2">
                              <Input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={newStockDisplayValue}
                                onChange={(event) =>
                                {
                                  field.onChange(event);
                                  handleActualCountChange(event.target.value);
                                }}
                                disabled={isAdjusting}
                                className="h-16 w-24 text-center text-2xl font-semibold tabular-nums border border-border bg-input shadow-sm"
                              />
                              <span className="text-sm text-muted-foreground">
                                {product.defaultUnit}
                              </span>
                            </div>
                          </Stack>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Note */}
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('inventory.adjustment.noteLabel')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('inventory.adjustment.notePlaceholder')}
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          disabled={isAdjusting}
                          maxLength={STOCK_ADJUSTMENT_NOTE_MAX_LENGTH}
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground text-right">
                        {t('inventory.adjustment.noteCount', {
                          count: field.value?.length ?? 0,
                          max: STOCK_ADJUSTMENT_NOTE_MAX_LENGTH,
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isAdjusting}
                    className="flex-1"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAdjusting}
                    className="flex-1"
                  >
                    {isAdjusting ? (
                      <>
                        <InlineSpinner size="sm" className="mr-2" />
                        {t('inventory.adjustment.saving')}
                      </>
                    ) : (
                      t('inventory.adjustment.save')
                    )}
                  </Button>
                </div>
              </Stack>
            </form>
          </Form>
        </Stack>
      </SheetContent>
    </Sheet>
  );
};
