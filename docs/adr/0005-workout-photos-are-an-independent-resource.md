# Workout photos are an independent resource; their edits commit live

A `WorkoutPhoto` is its own resource with its own endpoints, **not** a field of the
Workout Log. The Workout Log write (POST/PUT) owns only `Type`, `Description`, and
`Date` — it has no concept of photos. Consequently, on the detail page's edit mode,
adding or deleting a photo commits **immediately** (its own `POST`/`DELETE` call),
while edits to Type/Description/Date stay staged behind the form's Save/Cancel.

We chose this over *staging* photo changes and committing them transactionally with
the workout PUT. Staging async file uploads is genuinely fiddly — orphaned Cloudinary
uploads on Cancel, a pending-delete list, and N photo calls + 1 workout PUT committed
as a pseudo-transaction with partial-failure handling — for little gain on a personal
app. Treating photos as an independent resource keeps the same boundary we already
chose for Bodyweight Logs on the entry form (ADR-0004): the related resource is
written separately, and a failed photo write never undoes the workout.

## Consequences

- **The create form is necessarily staged**, not live: no Workout Log id exists until
  the workout is saved, so photos picked during creation are uploaded to Cloudinary
  and held, then `POST`ed only after the workout is created. Create stages; edit is
  live. This asymmetry is intentional — each path is as simple as it can be.
- **"Cancel" in edit mode does not roll back photo changes** — they already committed.
  Only Type/Description/Date are discarded on Cancel.
- A create-path photo failure follows ADR-0004: the workout is kept and the user is
  told the photo didn't save, rather than failing the whole entry.
