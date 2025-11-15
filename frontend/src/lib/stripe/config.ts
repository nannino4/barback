import type {
  Appearance,
  StripeElementLocale,
  StripeExpressCheckoutElementOptions,
  StripePaymentElementOptions,
} from '@stripe/stripe-js';

const BUSINESS_NAME = import.meta.env.VITE_APP_NAME as string || 'Barback';

export const stripeAppearance: Appearance = {
  theme: 'flat',
  variables: {
    colorPrimary: 'var(--color-primary)',
    colorPrimaryText: 'var(--color-primary-foreground)',
    colorBackground: 'var(--color-background)',
    colorText: 'var(--color-foreground)',
    colorTextPlaceholder: 'var(--color-muted-foreground)',
    colorDanger: 'var(--color-destructive)',
    borderRadius: '0.75rem',
    fontFamily:
      "Inter, 'Playfair Display', 'SF Pro Display', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
  },
  rules: {
    '.Input': {
      border: '1px solid var(--color-border)',
      boxShadow: 'none',
      padding: '12px 14px',
      color: 'var(--color-foreground)',
      backgroundColor: 'var(--color-card)',
    },
    '.Input:focus': {
      borderColor: 'var(--color-ring)',
      boxShadow: '0 0 0 3px var(--color-ring)',
    },
    '.Tab': {
      border: '1px solid var(--color-border)',
    },
    '.Tab:hover': {
      color: 'var(--color-foreground)',
    },
    '.Tab--selected': {
      color: 'var(--color-foreground)',
      borderColor: 'var(--color-primary)',
      boxShadow: '0 0 0 1px var(--color-primary)',
    },
    '.Block': {
      backgroundColor: 'var(--color-card)',
      boxShadow: 'none',
    },
    '.Label': {
      color: 'var(--color-muted-foreground)',
      fontWeight: '500',
    },
    '.Error': {
      color: 'var(--color-destructive)',
    },
  },
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
