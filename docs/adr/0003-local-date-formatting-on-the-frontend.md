# Frontend formats entry dates from local calendar parts, not `toISOString()`

Journal Entry dates (Workout Logs, Rest Days, and later Bodyweight) are sent to the API as plain `YYYY-MM-DD` strings built from the **local** year/month/day of the picked date. We deliberately do **not** use `Date.prototype.toISOString()`.

`toISOString()` converts to UTC first, so a date picked as "June 13" by a user behind UTC (e.g. any US timezone) is serialized as "June 12". Because the same-day override rules (ADR-0002) and the Streak are **day-grained**, that off-by-one silently marks entries on the wrong calendar day. A shared `toLocalDateString(date)` helper (in `core/utils/`) is the single formatter every form uses.

## Consequences

- The obvious-looking "fix" of switching to `toISOString()` reintroduces the bug — hence this record.
- All date-bearing forms (workout/rest log now; bodyweight, photos later) must route through the shared helper rather than formatting inline.
