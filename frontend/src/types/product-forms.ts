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