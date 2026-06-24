import { z } from 'zod';
import i18n from '@/lib/i18n';

// =============================================================================
// Category Form Schema
// =============================================================================

const categoryNameMaxLength = 255;
const categoryDescriptionMaxLength = 500;

export const CategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, i18n.t('validation.category.name.required'))
    .max(categoryNameMaxLength, i18n.t('validation.category.name.maxLength', {
      max: categoryNameMaxLength,
    })),
  description: z
    .string()
    .trim()
    .max(categoryDescriptionMaxLength, i18n.t('validation.category.description.maxLength', {
      max: categoryDescriptionMaxLength,
    }))
    .optional(),
  parentId: z
    .string()
    .trim()
    .optional()
    .nullable(),
});

export interface CategoryFormData
{
  [key: string]: string | null | undefined;
  name: string;
  description?: string;
  parentId?: string | null;
}
