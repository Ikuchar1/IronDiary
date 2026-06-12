# IronDiary

Personal fitness journal. Users record workout sessions, rest days, bodyweight, and progress photos for their own review.

## Language

**Workout Log**:
A record of a single workout session on a given date — has one Type, an optional free-text Description, and zero or more progress Photos.
_Avoid_: Workout, session record, entry

**Type**:
A single freeform label describing what a Workout Log was (e.g. "Push", "Pull", "Legs", "Yoga"). It is one label per workout, chosen freely by the user — never a constrained enum, and never a structured set of muscle groups.
_Avoid_: Category, split, muscle group, body part, tag

**Journal Entry**:
A dated record in the journal — either a Workout Log or a Rest Day. The term for items in any combined, mixed-type listing.
_Avoid_: Entry (unqualified), log item, record

**Rest Day**:
A dated record marking a day with no workout, with an optional Note. Distinct from simply having no Workout Log on that date. A Rest Day cannot be added to a date that has a Workout Log; logging a workout on a rest date overrides (removes) the Rest Day. Duplicate Rest Days on one date are tolerated and have no extra effect.
_Avoid_: Off day, break

**Streak**:
The number of consecutive days, counting back from today, on which the user logged at least one Workout Log **or** Rest Day. Broken by the first day with no log of either kind. Day-grained — multiple logs on the same day never increase it.
_Avoid_: Consistency score, run

**Gym Sessions (during streak)**:
A secondary count shown beneath the Streak: the number of individual Workout Logs (not day-deduped) whose date falls within the current Streak window. Exposes how much of a Streak was real training vs. Rest Days.
