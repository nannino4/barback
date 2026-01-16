export const SUPPORTED_LANGUAGES = ['en', 'it'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LOCALE_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  en: 'en-US',
  it: 'it-IT',
};

export const STRIPE_LOCALE_BY_LANGUAGE: Record<SupportedLanguage, 'en' | 'it'> = {
  en: 'en',
  it: 'it',
};

export const getLocaleFromLanguage = (language: string): string =>
{
  const normalized = language.toLowerCase();
  const supported = SUPPORTED_LANGUAGES.find((item) => normalized.startsWith(item));

  return supported ? LOCALE_BY_LANGUAGE[supported] : language;
};

export const getStripeLocaleFromLanguage = (language: string): 'en' | 'it' =>
{
  const normalized = language.toLowerCase();
  const supported = SUPPORTED_LANGUAGES.find((item) => normalized.startsWith(item));

  return supported ? STRIPE_LOCALE_BY_LANGUAGE[supported] : 'en';
};
