import i18n from '@/lib/i18n';

export const getValidationMessage = (key: string): string =>
{
  return i18n.t(key);
};