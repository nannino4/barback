export const formatCurrency = (
  value: number,
  locale: string,
  currency = 'EUR',
  options?: Intl.NumberFormatOptions,
): string =>
{
  try
  {
    const formatter = new Intl.NumberFormat(locale || 'en', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    });

    return formatter.format(value);
  }
  catch
  {
    return `${currency} ${value.toFixed(2)}`;
  }
};
