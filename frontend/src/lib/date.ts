export const formatDate = (
  dateInput: string | number | Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
): string =>
{
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime()))
  {
    return '';
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
};

