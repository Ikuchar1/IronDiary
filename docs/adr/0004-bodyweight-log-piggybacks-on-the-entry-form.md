# A Bodyweight Log is created from the entry form, but is not a Journal Entry

A Bodyweight Log (a dated weight measurement) is **not** a Journal Entry — it never appears on the `/log` Timeline and never affects the Streak (see CONTEXT.md). Yet for one-stop logging convenience, the `/log/new` entry form carries an **optional** weight field alongside the Workout/Rest toggle. When that field is filled, the form performs **two independent writes**: it saves the Workout Log or Rest Day first, then `POST`s a separate Bodyweight Log on the same date. If only the weight write fails, the Journal Entry is kept and a dismissible warning is shown — the primary record is never lost to a secondary failure.

The weight field is **create-only**: it appears on `/log/new`, not on the inline-edit path of the detail pages, because weight is a separate record managed on `/bodyweight`, not a property of a workout.

## Considered Options

- **Third "Weight" option on the entry toggle** — rejected: implies Workout/Rest/Weight are mutually exclusive, but weight is orthogonal (you can weigh in on a workout day, a rest day, or a scale-only day), and a "Weight entry" created there wouldn't appear on the Timeline it belongs to.
- **Optional weight field on the Workout/Rest form** (chosen) — keeps the real Workout-vs-Rest exclusion intact, treats weight as the orthogonal add-on it is, and needs no backend change (two existing endpoints).
- **Weight only on `/bodyweight`, never on the entry form** — rejected: cleanest boundary, but loses the one-stop logging the user explicitly wanted.

## Consequences

- Two endpoints, no transaction: the form must order the writes (entry first) and tolerate partial failure without rolling back the primary record. There is deliberately **no** compensating delete.
- The glossary boundary holds: sharing a *form* does not make a Bodyweight Log a Journal Entry — the form is UI, not a domain concept. CONTEXT.md remains the source of truth.
- Because weight is create-only here, editing or removing a Bodyweight Log lives solely on `/bodyweight` (delete + re-add; there is no PUT on BodyWeightLog).
