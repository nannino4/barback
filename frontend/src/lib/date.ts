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

/**
 * Whole days remaining until the given date, never negative. Used for trial
 * countdowns (e.g. "12 days left"). A date in the past returns 0.
 */
export const daysUntil = (dateInput: string | number | Date, now: number = Date.now()): number =>
{
  const target = dateInput instanceof Date ? dateInput.getTime() : new Date(dateInput).getTime();
  if (Number.isNaN(target))
  {
    return 0;
  }
  return Math.max(0, Math.ceil((target - now) / (24 * 60 * 60 * 1000)));
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

