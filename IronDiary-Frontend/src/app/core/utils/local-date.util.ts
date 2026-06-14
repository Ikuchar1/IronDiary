/**
 * Formats a Date as a `YYYY-MM-DD` string from its LOCAL calendar parts.
 *
 * Deliberately avoids `toISOString()`, which converts to UTC first and would
 * roll a date picked as "June 13" in a negative-offset zone back to the 12th.
 * The day-grained override rules (ADR-0002) and Streak depend on the local day.
 * See ADR-0003.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
