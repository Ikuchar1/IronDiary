# Frontend formats entry dates from local calendar parts, not `toISOString()`

Journal Entry dates (Workout Logs, Rest Days, and later Bodyweight) are sent to the API as plain `YYYY-MM-DD` strings built from the **local** year/month/day of the picked date. We deliberately do **not** use `Date.prototype.toISOString()`.

`toISOString()` converts to UTC first, so a date picked as "June 13" by a user behind UTC (e.g. any US timezone) is serialized as "June 12". Because the same-day override rules (ADR-0002) and the Streak are **day-grained**, that off-by-one silently marks entries on the wrong calendar day. A shared `toLocalDateString(date)` helper (in `core/utils/`) is the single formatter every form uses.

## Reading dates back (display)

The same calendar-day-not-instant principle applies on the **read** side. Entry dates are persisted at **midnight UTC** (the API stamps `DateTime.Kind = Utc`; see the backend "Entry `Date` columns" note), so the API serializes them with a `Z`, e.g. `2026-06-14T00:00:00Z`. Rendering that with the bare `{{ date | date }}` pipe formats it in the **viewer's local zone**, which rolls a negative-offset user (any US timezone) back to the **13th** — the read-side mirror of the `toISOString()` bug.

Therefore every entry-date display passes the explicit `'UTC'` timezone to the pipe:

```html
{{ entry.date | date: 'EEEE, MMM d' : 'UTC' }}
```

This shows the stored calendar day verbatim, so the Timeline, entry detail, dashboard, and the edit form all agree. Editing reads the day back the same way (`entry-detail` parses the `YYYY-MM-DD` part into a *local*-midnight `Date` for the picker), so the create/edit round-trip is stable and never drifts.

## Consequences

- The obvious-looking "fix" of switching to `toISOString()` reintroduces the write-side bug — hence this record.
- All date-bearing forms (workout/rest log now; bodyweight, photos later) must route through the shared `toLocalDateString` helper rather than formatting inline.
- All entry-date **displays** must pass `: 'UTC'` to the `date` pipe. A bare `{{ date | date }}` on an entry date is a bug — it silently shifts the day for non-UTC viewers.
