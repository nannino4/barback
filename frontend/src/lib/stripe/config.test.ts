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
    expect(appearance.variables?.colorPrimary).toBe('#f7d560');
    expect(appearance.rules?.['.Input']?.border).toContain('#');
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
        case '--color-foreground':
          return '#0f0f10';
        case '--color-muted-foreground':
          return 'oklch(0.66 0.01 60)';
        case '--color-destructive':
          return '#ff4d4f';
        case '--color-card':
          return '#fcfcfc';
        case '--color-border':
          return '#cfd0d1';
        default:
          return '';
        }
      },
    } as unknown as CSSStyleDeclaration);

    const appearance = buildStripeAppearance('light');
    expect(appearance.variables?.colorPrimary).toMatch(/^#/);
    expect(appearance.variables?.colorDanger).toMatch(/^#/);
    expect(appearance.rules?.['.Input:focus']?.boxShadow).toContain('rgba');
  });
});
