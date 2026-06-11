# Streak counts Rest Days and is day-grained, with a separate Gym-Sessions sub-stat

The dashboard Streak counts every consecutive day (back from today) on which the user logged **either** a Workout Log **or** a Rest Day, broken only by a day with no log at all. We made it day-grained — multiple logs on one day do not increase the count — because IronDiary is a daily journal, not a per-session tracker, and because rest is an essential part of training that should not break a consistency streak.

To keep this honest (a Rest-Day-only run would otherwise show an inflated Streak), the dashboard pairs the Streak with a **Gym Sessions** sub-stat: a raw, non-deduped count of Workout Logs within the streak window. So a week of pure rest reads "7-day streak · 0 gym sessions" — the number self-polices.

## Considered Options

- **Workout days only** (the original behavior) — rejected: punishes planned rest, which contradicts good training.
- **Rest days bridge but don't count** (streak shows workout-days only) — rejected: the displayed number lags the calendar span and reads confusingly.
- **Rest days count toward the number** (chosen) — clear definition, paired with the Gym-Sessions sub-stat to prevent gaming.

## Consequences

- The streak calculation must fetch Rest Days in addition to Workout Logs and merge their dates before walking back. It remains a frontend-derived value — no backend change.
- Two date-grain rules now coexist: the Streak dedupes by date; the Gym-Sessions sub-stat counts raw Workout Logs. Keep them distinct when implementing.
