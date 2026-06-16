import { dedupeByDay } from './bodyweight-series.util';
import { BodyWeightLogDto } from '../models/body-weight.model';

describe('dedupeByDay', () => {
  it('returns an empty array when there are no logs', () => {
    expect(dedupeByDay([])).toEqual([]);
  });

  it('keeps logs on distinct days and sorts them oldest to newest', () => {
    const logs: BodyWeightLogDto[] = [
      { id: 2, weight: 181, date: '2026-03-03T00:00:00Z' },
      { id: 1, weight: 180, date: '2026-03-01T00:00:00Z' },
      { id: 3, weight: 182, date: '2026-03-05T00:00:00Z' },
    ];

    expect(dedupeByDay(logs).map(l => l.id)).toEqual([1, 2, 3]);
  });

  it('collapses multiple logs on the same calendar day to the highest id', () => {
    const logs: BodyWeightLogDto[] = [
      { id: 5, weight: 180, date: '2026-03-01T08:00:00Z' },
      { id: 9, weight: 179, date: '2026-03-01T19:00:00Z' },
      { id: 7, weight: 181, date: '2026-03-01T12:00:00Z' },
    ];

    const result = dedupeByDay(logs);

    expect(result.length).toBe(1);
    expect(result[0].id).toBe(9);
    expect(result[0].weight).toBe(179);
  });
});
