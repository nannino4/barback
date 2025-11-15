import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildStripeAppearance } from './config';

describe('buildStripeAppearance', () =>
{
  afterEach(() =>
  {
    vi.restoreAllMocks();
  });

  it('falls back to theme palette when CSS variables are missing', () =>
  {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '',
    } as unknown as CSSStyleDeclaration);

    const appearance = buildStripeAppearance('dark');
    expect(appearance.variables?.colorPrimary).toBe('#dfb200');
    expect(appearance.variables?.colorBackground).toBe('#0e1216');
    expect(appearance.rules?.['.Input--invalid']?.boxShadow).toContain('rgba');
    expect(appearance.inputs).toBe('spaced');
    expect(appearance.labels).toBe('floating');
  });

  it('converts CSS variable colors to hex strings when available', () =>
  {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (prop: string) =>
      {
        switch (prop)
        {
        case '--color-primary':
        case '--color-ring':
          return 'oklch(0.78 0.18 93)';
        case '--color-primary-foreground':
          return '#050505';
        case '--color-background':
          return '#ffffff';
        case '--color-card':
          return '#fcfcfc';
        case '--color-input':
          return '#fafafa';
        case '--color-foreground':
          return '#0f0f10';
        case '--color-muted-foreground':
          return 'oklch(0.66 0.01 60)';
        case '--color-destructive':
          return '#ff4d4f';
        case '--color-destructive-foreground':
          return '#ffffff';
        case '--color-success':
          return '#1abc9c';
        case '--color-success-foreground':
          return '#010101';
        case '--color-warning':
          return '#fdd835';
        case '--color-warning-foreground':
          return '#0f0f10';
        case '--color-border':
          return '#cfd0d1';
        default:
          return '';
        }
      },
    } as unknown as CSSStyleDeclaration);

    const appearance = buildStripeAppearance('light');
    expect(appearance.variables?.colorPrimary).toMatch(/^#/);
    expect(appearance.variables?.colorDangerText).toMatch(/^#/);
    expect(appearance.variables?.colorTextPlaceholder).toContain('rgba');
    expect(appearance.rules?.['.Tab:focus-visible']?.boxShadow).toContain('rgba');
  });

  it('respects disableAnimations flag when provided', () =>
  {
    const appearance = buildStripeAppearance('light', { disableAnimations: true });
    expect(appearance.disableAnimations).toBe(true);
  });
});
