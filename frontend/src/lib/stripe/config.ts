import type {
  Appearance,
  StripeElementLocale,
  StripeExpressCheckoutElementOptions,
  StripePaymentElementOptions,
} from '@stripe/stripe-js';
import { formatHex, formatRgb, parse } from 'culori';
import type { ResolvedTheme } from '@/types/theme';

const BUSINESS_NAME = import.meta.env.VITE_APP_NAME as string || 'Barback';

type PaletteKey =
  | 'primary'
  | 'primaryText'
  | 'background'
  | 'text'
  | 'textMuted'
  | 'danger'
  | 'card'
  | 'border'
  | 'ring';

type StripePalette = Record<PaletteKey, string>;


const CSS_VARIABLES: Record<PaletteKey, string> = {
  primary: '--color-primary',
  primaryText: '--color-primary-foreground',
  background: '--color-background',
  text: '--color-foreground',
  textMuted: '--color-muted-foreground',
  danger: '--color-destructive',
  card: '--color-card',
  border: '--color-border',
  ring: '--color-ring',
};

const FALLBACK_PALETTES: Record<ResolvedTheme, StripePalette> = {
  light: {
    primary: '#b8860b',
    primaryText: '#ffffff',
    background: '#f8f7f3',
    text: '#1a1a1a',
    textMuted: '#6b6b6b',
    danger: '#c7463d',
    card: '#ffffff',
    border: '#d0d0d0',
    ring: '#b8860b',
  },
  dark: {
    primary: '#f7d560',
    primaryText: '#171717',
    background: '#0f1117',
    text: '#f8f7f3',
    textMuted: '#c5c5c5',
    danger: '#ff7b6b',
    card: '#161822',
    border: '#2c2f3a',
    ring: '#f7d560',
  },
};

const resolveCssColor = (varName: string, fallback: string): string =>
{
  if (typeof window === 'undefined' || typeof document === 'undefined')
  {
    return fallback;
  }

  const computed = window.getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!computed)
  {
    return fallback;
  }

  const parsed = parse(computed);
  if (!parsed)
  {
    return fallback;
  }

  return formatHex(parsed) ?? fallback;
};

const withAlpha = (color: string, alpha: number, fallback = `rgba(0, 0, 0, ${alpha})`): string =>
{
  const parsed = parse(color);
  if (!parsed)
  {
    return fallback;
  }

  return formatRgb({ ...parsed, alpha });
};

const buildPalette = (theme: ResolvedTheme): StripePalette =>
{
  const fallbacks = FALLBACK_PALETTES[theme];
  const entries = Object.entries(CSS_VARIABLES).map(([key, cssVar]) =>
  {
    const paletteKey = key as PaletteKey;
    return [paletteKey, resolveCssColor(cssVar, fallbacks[paletteKey])];
  });

  return Object.fromEntries(entries) as StripePalette;
};

export const buildStripeAppearance = (theme: ResolvedTheme = 'light'): Appearance =>
{
  const palette = buildPalette(theme);
  const ringShadow = withAlpha(palette.ring, 0.35, 'rgba(212, 175, 55, 0.35)');

  return {
    theme: 'flat',
    variables: {
      colorPrimary: palette.primary,
      colorPrimaryText: palette.primaryText,
      colorBackground: palette.background,
      colorText: palette.text,
      colorTextPlaceholder: palette.textMuted,
      colorDanger: palette.danger,
      borderRadius: '0.75rem',
      fontFamily:
        "Inter, 'Playfair Display', 'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
    },
    rules: {
      '.Input': {
        border: `1px solid ${palette.border}`,
        boxShadow: 'none',
        padding: '12px 14px',
        color: palette.text,
        backgroundColor: palette.card,
      },
      '.Input:focus': {
        borderColor: palette.ring,
        boxShadow: `0 0 0 3px ${ringShadow}`,
      },
      '.Tab': {
        border: `1px solid ${palette.border}`,
      },
      '.Tab:hover': {
        color: palette.text,
      },
      '.Tab--selected': {
        color: palette.text,
        borderColor: palette.primary,
        boxShadow: `0 0 0 1px ${palette.primary}`,
      },
      '.Block': {
        backgroundColor: palette.card,
        boxShadow: 'none',
      },
      '.Label': {
        color: palette.textMuted,
        fontWeight: '500',
      },
      '.Error': {
        color: palette.danger,
      },
    },
  };
};

export const expressCheckoutOptions: StripeExpressCheckoutElementOptions = {
  paymentMethods: {
    applePay: 'always',
    googlePay: 'always',
    amazonPay: 'never',
    link: 'never',
  },
  business: {
    name: BUSINESS_NAME,
  },
};

export const paymentElementOptions: StripePaymentElementOptions = {
  layout: 'tabs',
  business: {
    name: BUSINESS_NAME,
  },
  wallets: {
    applePay: 'auto',
    googlePay: 'auto',
  },
  fields: {
    billingDetails: {
      name: 'never',
      email: 'never',
      phone: 'never',
      address: 'never',
    },
  },
};

export const getStripeLocale = (language: string): StripeElementLocale =>
{
  switch (language)
  {
  case 'it':
  {
    return 'it';
  }
  case 'en':
  default:
  {
    return 'en';
  }
  }
};
