import { z } from 'zod';
import i18n from '@/lib/i18n';
import { StockAdjustmentTypeSchema } from '@/types/product';

// =============================================================================
// Stock Adjustment Form Schema
// =============================================================================

const noteMaxLength = 500;

export const StockAdjustmentFormSchema = z.object({
  type: StockAdjustmentTypeSchema,
  quantity: z
    .string()
    .trim()
    .optional(),
  actualCount: z
    .string()
    .trim()
    .optional(),
  note: z
    .string()
    .max(noteMaxLength, i18n.t('validation.inventory.note.maxLength', {
      max: noteMaxLength,
    }))
    .optional(),
});

export type StockAdjustmentFormData = z.infer<typeof StockAdjustmentFormSchema>;

export const STOCK_ADJUSTMENT_NOTE_MAX_LENGTH = noteMaxLength;

// =============================================================================
// Product Form Schema
// =============================================================================

const productNameMaxLength = 200;
const productBrandMaxLength = 100;
const productDescriptionMaxLength = 1000;
const productUnitMaxLength = 50;

const optionalNonNegativeNumber = (mustBeNumberMessage: string, minMessage: string) =>
{
  return z
    .string()
    .trim()
    .refine((value) => value === '' || !Number.isNaN(Number(value)), {
      message: mustBeNumberMessage,
    })
    .refine((value) => value === '' || Number(value) >= 0, {
      message: minMessage,
    });
};

export interface ProductFormData
{
  [key: string]: string | string[] | undefined;
  name: string;
  brand?: string;
  description?: string;
  defaultUnit: string;
  defaultPurchasePrice: string;
  currentQuantity: string;
  categoryIds?: string[];
}

export const ProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, i18n.t('validation.product.name.required'))
    .max(productNameMaxLength, i18n.t('validation.product.name.maxLength', {
      max: productNameMaxLength,
    })),
  brand: z
    .string()
    .trim()
    .max(productBrandMaxLength, i18n.t('validation.product.brand.maxLength', {
      max: productBrandMaxLength,
    }))
    .optional(),
  description: z
    .string()
    .trim()
    .max(productDescriptionMaxLength, i18n.t('validation.product.description.maxLength', {
      max: productDescriptionMaxLength,
    }))
    .optional(),
  defaultUnit: z
    .string()
    .trim()
    .min(1, i18n.t('validation.product.defaultUnit.required'))
    .max(productUnitMaxLength, i18n.t('validation.product.defaultUnit.maxLength', {
      max: productUnitMaxLength,
    })),
  defaultPurchasePrice: optionalNonNegativeNumber(
    i18n.t('validation.product.defaultPurchasePrice.mustBeNumber'),
    i18n.t('validation.product.defaultPurchasePrice.min'),
  ),
  currentQuantity: optionalNonNegativeNumber(
    i18n.t('validation.product.currentQuantity.mustBeNumber'),
    i18n.t('validation.product.currentQuantity.min'),
  ),
  categoryIds: z.array(z.string()).optional(),
}) satisfies z.ZodType<ProductFormData>;