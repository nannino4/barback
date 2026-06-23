import { describe, it, expect } from 'vitest';
import { daysUntil } from './date';

describe('daysUntil', () =>
{
  const now = new Date('2026-06-01T00:00:00.000Z').getTime();
  const day = 24 * 60 * 60 * 1000;

  it('rounds up partial days to whole days remaining', () =>
  {
    // 11.5 days away -> 12 whole days left
    expect(daysUntil(now + 11.5 * day, now)).toBe(12);
  });

  it('returns exact whole days for an exact boundary', () =>
  {
    expect(daysUntil(now + 7 * day, now)).toBe(7);
  });

  it('never returns negative for past dates', () =>
  {
    expect(daysUntil(now - 5 * day, now)).toBe(0);
  });

  it('returns 0 when the date is now', () =>
  {
    expect(daysUntil(now, now)).toBe(0);
  });

  it('accepts ISO date strings', () =>
  {
    expect(daysUntil('2026-06-04T00:00:00.000Z', now)).toBe(3);
  });

  it('returns 0 for an invalid date', () =>
  {
    expect(daysUntil('not-a-date', now)).toBe(0);
  });
});
