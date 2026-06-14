import { toLocalDateString } from './local-date.util';

describe('toLocalDateString', () => {
  it('formats a local June 13 date as "2026-06-13", never the prior day (ADR-0003)', () => {
    // Local midnight on June 13. toISOString() in a negative-offset (US) zone
    // would roll this back to the 12th; the helper must use local parts.
    const localJune13 = new Date(2026, 5, 13);

    expect(toLocalDateString(localJune13)).toBe('2026-06-13');
  });

  it('zero-pads single-digit months and days', () => {
    const localJan5 = new Date(2026, 0, 5);

    expect(toLocalDateString(localJan5)).toBe('2026-01-05');
  });
});
