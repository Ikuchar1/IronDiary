# Cloudinary signed uploads via a generic upload-signature endpoint

Images are hosted on Cloudinary and uploaded **directly from the frontend** using a
**signed** upload: the frontend asks our API for a one-time signature, uploads the
file to Cloudinary with it, then saves the returned URL via the relevant resource
endpoint (`POST /api/workoutphoto` for workout photos). We chose signed over an
unsigned upload preset so that, once deployed, randoms can't spam our Cloudinary
account with a public preset name — the security backlog already required this.

The signature is **hand-rolled and timestamp-only**: `SHA1(timestamp + apiSecret)`,
hex-lowercase. With a single signed param there is no param-sorting/joining to get
wrong, so the Cloudinary .NET SDK earns nothing here. The day we need to *enforce*
signed params (folder, allowed formats, `public_id`) we'd sort/join several keys, and
that is when we should switch to the SDK — not before.

Because a signature knows nothing about workouts, signing lives on a **generic
`POST /api/upload/signature`** (an `UploadController`), **not** on
`WorkoutPhotoController`. Profile-picture upload (a separate future PR) will reuse the
exact same endpoint; only the final "save the URL" step differs.

## Consequences

- **Profile pictures are NOT `WorkoutPhoto`s.** A `WorkoutPhoto` is tethered to a
  Workout Log by a required FK (see CONTEXT.md: a Photo never exists standalone). A
  profile picture has no workout and lives on `AppUser.ProfilePictureUrl`. Do not
  consolidate all images into one photos/media table — the shared part is the *upload
  plumbing*, not the *domain model*.
- Cloudinary `CloudName` / `ApiKey` / **`ApiSecret`** are configured exactly like
  `Jwt:Key`: **.NET User Secrets in dev, environment variables in prod**. The secret
  never ships in `appsettings`.
- `POST /api/workoutphoto` should **validate the saved URL is actually a Cloudinary
  URL** (security backlog), since the frontend supplies it after upload.
- Still open before any public deploy (kept on the security backlog): set size/format
  limits on a signed upload preset in the Cloudinary dashboard.
