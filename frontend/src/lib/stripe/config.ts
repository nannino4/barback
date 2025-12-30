import type {
  Appearance,
  StripeElementLocale,
  StripeElementsOptions,
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
  | 'card'
  | 'input'
  | 'text'
  | 'textMuted'
  | 'danger'
  | 'dangerText'
  | 'success'
  | 'successText'
  | 'warning'
  | 'warningText'
  | 'border'
  | 'ring';

type StripePalette = Record<PaletteKey, string>;


const CSS_VARIABLES: Record<PaletteKey, string> = {
  primary: '--color-primary',
  primaryText: '--color-primary-foreground',
  background: '--color-background',
  card: '--color-card',
  input: '--color-input',
  text: '--color-foreground',
  textMuted: '--color-muted-foreground',
  danger: '--color-destructive',
  dangerText: '--color-destructive-foreground',
  success: '--color-success',
  successText: '--color-success-foreground',
  warning: '--color-warning',
  warningText: '--color-warning-foreground',
  border: '--color-border',
  ring: '--color-ring',
};

const FALLBACK_PALETTES: Record<ResolvedTheme, StripePalette> = {
  light: {
    primary: '#bc7600',
    primaryText: '#fffdfa',
    background: '#f7f0eb',
    card: '#fffdfa',
    input: '#fffaf5',
    text: '#12171a',
    textMuted: '#5e6468',
    danger: '#d40c1a',
    dangerText: '#fffdfa',
    success: '#00702e',
    successText: '#fffdfa',
    warning: '#b15600',
    warningText: '#12171a',
    border: '#c3bcb7',
    ring: '#bc7600',
  },
  dark: {
    primary: '#dfb200',
    primaryText: '#080c0f',
    background: '#080c0f',
    card: '#12171a',
    input: '#0e1216',
    text: '#faf4ef',
    textMuted: '#97918c',
    danger: '#ea0009',
    dangerText: '#faf4ef',
    success: '#00c271',
    successText: '#080c0f',
    warning: '#ff9100',
    warningText: '#080c0f',
    border: '#363b3f',
    ring: '#dfb200',
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

type BuildAppearanceOptions = {
  disableAnimations?: boolean;
};

export const stripeFonts: NonNullable<StripeElementsOptions['fonts']> = [
  {
    cssSrc:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600&display=swap',
  },
];

export const buildStripeAppearance = (
  theme: ResolvedTheme = 'light',
  options: BuildAppearanceOptions = {},
): Appearance =>
{
  const palette = buildPalette(theme);
  const ringShadow = withAlpha(palette.ring, 0.35, 'rgba(212, 175, 55, 0.35)');
  const dangerRingShadow = withAlpha(palette.danger, 0.35, 'rgba(240, 90, 90, 0.35)');
  const placeholderColor = withAlpha(palette.textMuted, 0.6, 'rgba(150, 150, 150, 0.6)');
  const selectionColor = withAlpha(palette.primary, 0.25, 'rgba(191, 141, 0, 0.25)');
  const { disableAnimations = false } = options;

  return {
    theme: 'flat',
    inputs: 'spaced',
    labels: 'floating',
    disableAnimations,
    variables: {
      colorPrimary: palette.primary,
      colorPrimaryText: palette.primaryText,
      colorBackground: palette.input,
      colorText: palette.text,
      colorTextSecondary: palette.textMuted,
      colorTextPlaceholder: placeholderColor,
      colorIcon: palette.textMuted,
      colorDanger: palette.danger,
      colorDangerText: palette.dangerText,
      colorSuccess: palette.success,
      colorSuccessText: palette.successText,
      colorWarning: palette.warning,
      colorWarningText: palette.warningText,
      borderRadius: '12px',
      fontSizeBase: '16px',
      spacingUnit: '10px',
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
      '.Input::placeholder': {
        color: placeholderColor,
      },
      '.Input::selection': {
        backgroundColor: selectionColor,
        color: palette.primaryText,
      },
      '.Input:focus': {
        borderColor: palette.ring,
        boxShadow: `0 0 0 3px ${ringShadow}`,
      },
      '.Input:disabled': {
        opacity: '0.6',
        cursor: 'not-allowed',
      },
      '.Input--invalid': {
        borderColor: palette.danger,
        boxShadow: `0 0 0 3px ${dangerRingShadow}`,
      },
      '.Tab': {
        border: `1px solid ${palette.border}`,
      },
      '.Tab:hover': {
        color: palette.text,
      },
      '.Tab--selected': {
        color: palette.primaryText,
        borderColor: palette.primary,
        boxShadow: `0 0 0 1px ${palette.primary}`,
      },
      '.Tab:focus-visible': {
        boxShadow: `0 0 0 2px ${ringShadow}`,
        borderColor: palette.ring,
      },
      '.Tab:disabled': {
        color: palette.textMuted,
        borderColor: palette.border,
        opacity: '0.6',
      },
      '.Block': {
        backgroundColor: palette.card,
        boxShadow: 'none',
      },
      '.BlockDivider': {
        borderColor: palette.border,
      },
      '.BlockAction': {
        color: palette.primary,
      },
      '.BlockAction:hover': {
        color: palette.primaryText,
        backgroundColor: selectionColor,
      },
      '.Label': {
        color: palette.textMuted,
        fontWeight: '500',
      },
      '.Label--invalid': {
        color: palette.danger,
      },
      '.Error': {
        color: palette.danger,
      },
      '.RadioIcon': {
        width: '20px',
        height: '20px',
      },
      '.RadioIconOuter': {
        stroke: palette.border,
      },
      '.RadioIconOuter--checked': {
        stroke: palette.primary,
      },
      '.RadioIconInner': {
        fill: palette.primary,
      },
      '.RadioIconInner--checked': {
        fill: palette.primary,
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
      name: 'auto',
      email: 'auto',
      phone: 'auto',
      address: 'auto',
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
