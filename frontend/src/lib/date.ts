import { getLocaleFromLanguage } from '@/constants/i18n';

export type TimeZonePreference = string | undefined;

export const getBrowserTimeZone = (): string | null =>
{
  try
  {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timeZone || null;
  }
  catch
  {
    return null;
  }
};

export const resolveTimeZone = (timeZonePreference?: TimeZonePreference): string | undefined =>
{
  if (!timeZonePreference || timeZonePreference === 'auto')
  {
    const browserTimeZone = getBrowserTimeZone();
    return browserTimeZone || undefined;
  }

  return timeZonePreference;
};

export const formatDate = (
  dateInput: string | number | Date,
  language: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  timeZonePreference?: TimeZonePreference,
): string =>
{
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime()))
  {
    return '';
  }

  const resolvedTimeZone = options.timeZone ?? resolveTimeZone(timeZonePreference);
  const formatOptions = resolvedTimeZone
    ? {
      ...options,
      timeZone: resolvedTimeZone,
    }
    : options;

  return new Intl.DateTimeFormat(getLocaleFromLanguage(language), formatOptions).format(date);
};

