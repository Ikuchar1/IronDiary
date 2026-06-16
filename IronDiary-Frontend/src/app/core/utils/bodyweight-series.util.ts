import { BodyWeightLogDto } from '../models/body-weight.model';

/**
 * Collapses Bodyweight Logs to one per calendar day for charting.
 *
 * When the user weighs in more than once on the same calendar day, only the
 * most recently created log (highest `id`) is kept. The result is sorted
 * oldest -> newest so a line chart reads left-to-right in time.
 *
 * The day key is the `YYYY-MM-DD` portion of the date string. Per ADR-0003 the
 * backend stores the chosen day as midnight-UTC, so the date portion already IS
 * the intended calendar day -- slicing it avoids the off-by-one that parsing a
 * midnight-UTC value into a negative-offset local zone would reintroduce.
 */
export function dedupeByDay(logs: BodyWeightLogDto[]): BodyWeightLogDto[] {
  const byDay = new Map<string, BodyWeightLogDto>();
  for (const log of logs) {
    const day = log.date.slice(0, 10);
    const existing = byDay.get(day);
    if (!existing || log.id > existing.id) {
      byDay.set(day, log);
    }
  }
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}
