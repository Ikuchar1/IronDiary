# A Workout Log overrides a Rest Day on the same date

A date cannot honestly hold both a Rest Day ("a day with no workout") and a Workout Log. When the user creates — or moves, via date edit — a Workout Log onto a date that has a Rest Day, the API **deletes that Rest Day** as part of the same operation. The reverse is rejected: creating or moving a Rest Day onto a date that already has a Workout Log returns `409 Conflict`. Duplicate Rest Days on one date are tolerated (harmless under the day-grained Streak, and convenient for manual testing).

The asymmetry reflects intent: actually training is the stronger fact and should win without friction (the common case is marking the morning a rest day, then getting dragged to the gym that evening); claiming rest on a day you demonstrably trained is simply wrong and gets refused.

## Considered Options

- **Reject both directions (409 + delete-first)** — rejected: forces a manual delete in the most common real-world flow (rest plans change).
- **Allow coexistence** — rejected: contradicts the Rest Day definition in CONTEXT.md and muddies the Streak's meaning.
- **Workout silently overrides** (chosen) — frictionless for the honest case; the destructive side effect is bounded (one optional-note record) and covered by integration tests.

## Consequences

- `POST` and `PUT` on WorkoutLog must both apply the override, and `POST`/`PUT` on RestDay must both apply the 409 check — share one invariant helper so the paths cannot drift.
- Deleting data as a side effect of a create is surprising: the frontend should say so ("This replaces your Rest Day on June 10"), and the behavior is locked in by xUnit integration tests in `IronDiary.Api.Tests`.
- Enforcement lives in the API, not the UI, so any client (Postman included) gets the same rules.
