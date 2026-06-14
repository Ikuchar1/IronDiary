# IronDiary — Project Context - Last Updated June 12th 2026

## Interaction
- Start every single reply to the user with their name, "Ian".

## Overview
Personal fitness journal web app. Users log workouts (freeform type — Push/Pull/Legs or anything else), rest days, bodyweight entries, and progress photos. Features: streak tracking, bodyweight chart, progress photo grid. Deployed as a mobile-friendly web app for gym use.

## Repo Structure
```
IronDiary/
├── IronDiary.Api/           ← ASP.NET Core Web API (.NET 9, C#)
└── IronDiary-Frontend/      ← Angular 19 frontend
```

## Tech Stack
- **Backend**: ASP.NET Core Web API, .NET 9.0.101, C#
- **Database**: PostgreSQL 14.18 (local via Homebrew, managed with TablePlus)
- **ORM**: Entity Framework Core 9
- **Auth**: ASP.NET Core Identity + JWT Bearer tokens (1-day expiry)
- **Frontend**: Angular 19.2.20 (CLI 19.2.22), standalone components, Angular Material
- **Theme**: dark cyan `#00BCD4` / orange `#f98e39`, background `#1a1a1a`
- **Fonts**: DM Serif Display (headings), DM Sans (body)
- **Deployment**: Local only — PostgreSQL@14 via `brew services start postgresql@14`, API via `dotnet run`, frontend via `ng serve`

---

## Backend — IronDiary.Api

### Folder Structure
```
IronDiary.Api/
├── Controllers/
│   ├── AuthController.cs
│   ├── WorkoutLogController.cs
│   ├── WorkoutPhotoController.cs
│   ├── BodyWeightLogController.cs
│   └── RestDayController.cs
├── Models/
│   ├── AppUser.cs           ← extends IdentityUser; has CreatedAt, ProfilePictureUrl
│   ├── WorkoutLog.cs        ← Id, Type (string), Description?, Date, Photos, UserId
│   ├── WorkoutPhoto.cs      ← Id, Url, WorkoutLogId, WorkoutLog (nav), UserId
│   ├── BodyWeightLog.cs     ← Id, Date, Weight (float, pounds), UserId
│   └── RestDay.cs           ← Id, Date, Note?, UserId
├── DTOs/
│   ├── WorkoutLogDto.cs     ← WorkoutLogDto, CreateWorkoutLogDto, WorkoutLogDetailDto
│   ├── WorkoutPhotoDto.cs   ← WorkoutPhotoDto, CreateWorkoutPhotoDto
│   ├── BodyWeightLogDto.cs  ← BodyWeightLogDto, CreateBodyWeightLogDto
│   ├── RestDayDto.cs        ← RestDayDto, CreateRestDayDto
│   ├── LoginDto.cs
│   └── RegisterDto.cs
├── Data/
│   └── AppDbContext.cs      ← IdentityDbContext<AppUser>; DbSets: WorkoutLogs, RestDays, BodyWeightLogs, WorkoutPhotos
├── Rules/
│   └── SameDayRules.cs      ← static day-grained Journal Entry invariants (ADR-0002), shared by create/edit paths
├── Migrations/              ← EF Core migrations — do not manually edit
└── Program.cs
```

### Controller Endpoints
All resource controllers use `[Authorize]` and `[Route("api/[controller]")]`. JWT claim `ClaimTypes.NameIdentifier` is used to scope all queries to the current user.

| Controller | Endpoints |
|---|---|
| AuthController | POST /api/auth/register, POST /api/auth/login |
| WorkoutLogController | GET /api/workoutlog, POST /api/workoutlog, GET /api/workoutlog/{id}, PUT /api/workoutlog/{id}, DELETE /api/workoutlog/{id}, GET /api/workoutlog/range?startDate=&endDate= |
| WorkoutPhotoController | GET /api/workoutphoto, POST /api/workoutphoto, GET /api/workoutphoto/{id}, DELETE /api/workoutphoto/{id} |
| BodyWeightLogController | GET /api/bodyweightlog, POST /api/bodyweightlog, GET /api/bodyweightlog/{id}, DELETE /api/bodyweightlog/{id} |
| RestDayController | GET /api/restday, POST /api/restday, GET /api/restday/{id}, PUT /api/restday/{id}, DELETE /api/restday/{id} |

**Note: WorkoutLog and RestDay have PUT endpoints; WorkoutPhoto and BodyWeightLog do not.** PUT accepts the same body as create and returns 404 for nonexistent or other users' ids. Per ADR-0002: POST and PUT on WorkoutLog return `WorkoutLogWriteResultDto` (wraps the workout DTO + `OverrodeRestDay` flag); POST and PUT on RestDay return 409 (displayable message) when the date holds one of the user's Workout Logs.

### Backend Key Patterns
- Controllers inject `AppDbContext` directly — no repository or service layer. (Exception: stateless invariant helpers in `Rules/`, e.g. `SameDayRules`, are allowed. They are **static** and take `AppDbContext` as a parameter — not DI-registered services or repositories. Per ADR-0002 they exist so the create and edit paths share one rule and can't drift. The caller still owns `SaveChangesAsync`.)
- Raw EF models are never returned from controllers; always map to DTOs
- `WorkoutLogController.GetById` uses `.Include(w => w.Photos)` and returns `WorkoutLogDetailDto`
- List endpoints return the lightweight DTO (no photos included)
- All resources filtered by authenticated user's ID from JWT claims
- JSON configured with `ReferenceHandler.IgnoreCycles` to handle circular nav properties
- Swagger configured with Bearer auth for testing protected endpoints
- CORS currently only allows `http://localhost:4200`
- JWT config keys: `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience` (from appsettings / env vars)
- **Entry `Date` columns are Postgres `timestamptz`, which Npgsql only writes when `DateTime.Kind == Utc`.** Every write path (WorkoutLog/RestDay POST + PUT) stamps the incoming `dto.Date` with `DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc)` **before** any DB use (the same-day query fails on `Unspecified` too). Use `SpecifyKind`, **not** `ToUniversalTime()` — converting would shift the calendar day and reintroduce the off-by-one ADR-0003 guards against. The frontend sends a bare `YYYY-MM-DD` (ADR-0003), which binds to midnight-`Unspecified`; the range query already did this at `WorkoutLogController` GET `/range`.

### Known Backend Issues
- No UPDATE (PUT) endpoint on WorkoutPhoto or BodyWeightLog

### Testing
Two complementary suites:

- **`IronDiary.Api.Tests`** (xUnit + `WebApplicationFactory`) — the automated suite. Run with `dotnet test` from the repo root; no running API or database needed. The fixture (`IronDiaryApiFactory`) swaps the real Npgsql/PostgreSQL provider for **in-memory SQLite**, so these run fast and in CI with zero setup. They assert on HTTP status codes, response bodies, and follow-up GETs — never on internals.
- **`postman-collection.json` + `postman-environment.json`** — a manual suite that runs against the **real running API wired to the actual PostgreSQL database** (`dotnet run`, then run the collection in Postman/Newman). **I run these manually.**

**Why both:** SQLite and PostgreSQL don't translate LINQ identically, so a passing SQLite test does *not* prove the same query behaves the same on Postgres. The clearest example is the day-grained date comparison in `Rules/SameDayRules.cs` (`.Date.Date == day`) — Npgsql may translate it differently than SQLite. The **`Same-Day Rules (Postgres day-grained)` folder in the Postman collection** exists specifically to cover what SQLite can't prove: same-calendar-day-different-time scenarios (409 on Rest Day create/PUT, override on Workout create/PUT) plus a different-day negative control, all against real Postgres. **Re-run that folder after any change to `SameDayRules` or other day-grained `.Date` query logic.**

---

## Frontend — IronDiary-Frontend

### Folder Structure
```
IronDiary-Frontend/src/
├── app/
│   ├── app.component.ts / .html / .css
│   ├── app.config.ts          ← registers router, HttpClient with authInterceptor
│   ├── app.routes.ts          ← route definitions
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts          ← functional guard; redirects to /login if no token
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts    ← functional HttpInterceptorFn; attaches Bearer token
│   │   ├── models/
│   │   │   ├── workout-log.model.ts   ← WorkoutPhotoDto, WorkoutLogDto, WorkoutLogDetailDto, WorkoutLogWriteResultDto, CreateWorkoutLogDto
│   │   │   ├── body-weight.model.ts   ← BodyWeightLogDto, CreateBodyWeightLogDto
│   │   │   ├── rest-day.model.ts      ← RestDayDto, CreateRestDayDto
│   │   │   └── journal-entry.model.ts ← JournalEntry discriminated union (frontend-only view model: { kind, id, date, data })
│   │   ├── services/
│   │   │   ├── auth.service.ts        ← login, register, logout, saveToken, getToken, isLoggedIn
│   │   │   ├── workout-log.service.ts ← getWorkoutLogs, createWorkoutLog, updateWorkoutLog, getWorkoutLogById, deleteWorkoutLog, getWorkoutLogsByDateRange
│   │   │   ├── body-weight.service.ts ← getAll() (confirmed from dashboard usage)
│   │   │   └── rest-day.service.ts
│   │   └── utils/
│   │       ├── streak.util.ts          ← calculateStreak (+ spec)
│   │       ├── journal-entry.util.ts   ← mergeJournalEntries: merge + newest-first sort of workouts/rest days into JournalEntry[] (+ spec)
│   │       └── local-date.util.ts      ← toLocalDateString: YYYY-MM-DD from LOCAL calendar parts, never toISOString (ADR-0003) (+ spec)
│   ├── pages/
│   │   ├── home/           ← public landing page (hero, features, how-it-works)
│   │   ├── login/          ← login form
│   │   ├── register/       ← register form
│   │   ├── dashboard/      ← streak counter, most recent workout, latest bodyweight, recent activity list (5 logs), quick log button
│   │   └── log/            ← Timeline list (LogComponent); entry-detail/ (EntryDetailComponent serves /log/workout/:id & /log/rest/:id, read-only + delete); entry-form/ (EntryFormComponent — /log/new create form, Workout/Rest toggle)
│   └── shared/
│       └── components/
│           ├── navbar/
│           ├── footer/
│           └── confirm-dialog/   ← reusable MatDialog confirm body (ConfirmDialogComponent; closes true/false)
├── environments/
│   ├── environment.ts             ← production placeholder (not yet configured — app is local only)
│   └── environment.development.ts ← local dev (apiUrl: 'http://localhost:5092/api')
├── styles/
│   └── _variables.scss    ← $cyan, $orange, $bg, $surface, $border, $text-primary, $text-muted
└── styles.scss
```

### SCSS Variables (src/styles/_variables.scss)
```scss
$cyan: #00BCD4;
$orange: #f98e39;
$bg: #1a1a1a;
$surface: #222222;
$border: rgba(255, 255, 255, 0.08);
$text-primary: #f0f0f0;
$text-muted: rgba(255, 255, 255, 0.5);
```

### Routes
| Path | Component | Guard |
|---|---|---|
| / | → redirects to /home | |
| /home | HomeComponent | none |
| /login | LoginComponent | none |
| /register | RegisterComponent | none |
| /dashboard | DashboardComponent | authGuard |
| /log | LogComponent (Timeline list) | authGuard |
| /log/new | EntryFormComponent (create: Workout/Rest toggle) | authGuard |
| /log/workout/:id | EntryDetailComponent (`data: { kind: 'workout' }`) | authGuard |
| /log/rest/:id | EntryDetailComponent (`data: { kind: 'rest' }`) | authGuard |

Routes still to build: `/bodyweight`, `/photos`, `/profile`. Inline edit on the detail routes is #13.

### Frontend Key Patterns
- All components are standalone (no NgModules)
- Services: `@Injectable({ providedIn: 'root' })`, HttpClient injected, `apiUrl` built from `environment.apiUrl`
- Always import from `environment.ts` (not `environment.development.ts`) — Angular's build system handles the swap
- JWT stored in `localStorage` under key `'token'`, attached via functional interceptor
- `authGuard` is a functional guard (not class-based `CanActivate`)
- `authInterceptor` is a functional `HttpInterceptorFn`
- Angular Material used for UI components (MatCard, MatButton, MatList, MatChips, MatProgressSpinner, MatDialog confirmed in use)
- Delete confirmation uses the shared `ConfirmDialogComponent` via `MatDialog`; the dialog returns `true`/`false` through `afterClosed()`
- Pages use `.scss`; some older shared components still have `.css` files alongside (do not rename)

### Known Frontend Issues / Gotchas
- Production `apiUrl` in `environment.ts` is still a placeholder URL
- `WorkoutPhotoDto` is defined in `workout-log.model.ts` (not its own file)

---

## Pages Status
**Built:** home, login, register, dashboard
**In progress:** log — Timeline list (#10), entry detail/delete (#11), new-entry form `/log/new` (#12) done; remaining: inline edit (#13), datepicker theming (#14 — colors partially done but inverted vs spec, see backlog)
**To build:** bodyweight tracker (with chart), progress photo grid, profile
**Future:** GitHub-style activity graph on dashboard

---

## Backlog / Next Steps

> **Rule:** Once an item below is fully implemented, remove it from this list.

### Pages to Build
- [ ] `/log` — **frontend Timeline page (GitHub issue #9, sliced into #10–#14).** All slices land on branch `feature/log-page-ui` → **PR #15** (one branch, one merge; `Closes #10`/`#11`/`#12` accumulating as slices land). **Done:** #10 Timeline list, #11 entry detail + delete, #12 new-entry form (`/log/new`, create + override/409 rules). **Remaining:** #13 inline edit on the detail page, #14 datepicker theming. Design captured in CONTEXT.md (Timeline term), ADR-0002 (override rules), and ADR-0003 (local date formatting).
  - **#14 color decision is unresolved:** the issue spec says selected date = cyan, today ring = orange, but the datepicker was themed live to the *inverse* (selected = orange, today = cyan) per author preference. Reconcile before closing #14 — either update the issue/ADR to match, or flip the colors in `styles.scss`.
  - Photos: detail view renders a dashed placeholder and ignores the `photos` array (#11); real display + upload waits for `/photos` + Cloudinary
- [ ] `/bodyweight` — log and chart bodyweight over time (uses `BodyWeightService`)
- [ ] `/photos` — progress photo grid (uses `WorkoutPhotoService`)
- [ ] `/profile` — user profile page

### Integrations
- [ ] **Cloudinary** photo hosting — free tier (25GB storage/bandwidth). Flow: user picks a photo on the frontend → upload directly to Cloudinary → get back a URL → save URL via `POST /api/workoutphoto`. No backend model changes needed, `WorkoutPhoto.Url` already stores a string URL. Tackle this when building the `/photos` page.

### Chores / Refactors
- [ ] **E2E / integration tests against real Postgres.** The xUnit suite runs on in-memory SQLite, which can't catch Postgres-specific issues (e.g. the `DateTime.Kind=Unspecified` → timestamptz write error that broke `/log/new` creates — SQLite ignores `Kind`). Today only the manual Postman collection covers real-Postgres behavior. Add an automated end-to-end layer that drives the real API (and ideally the frontend) against an actual Postgres instance — e.g. a Testcontainers-backed `WebApplicationFactory` for the API, and/or Playwright/Cypress for full browser flows — so date/timezone and other provider-specific regressions are caught in CI, not by hand.
- [ ] Convert all remaining `.css` files to `.scss` (older shared components still use `.css`). When done, remove the "do not rename" note under Frontend Key Patterns.
- [ ] Write a nice `README.md` at the repo root — project overview, screenshots, tech stack, local setup/run instructions for both API and frontend.
- [ ] `/home` shows "Get Started" (create account) and "Sign In" CTAs even when the user is already logged in. When authenticated, swap those for an authed CTA (e.g. "Go to Dashboard" / "Log Workout" — exact copy TBD). Gate on `authService.isLoggedIn()`.
- [ ] **Token expiry handling (frontend).** `authService.isLoggedIn()` only checks the JWT *exists*, not that it's still valid. An expired-but-present token passes `authGuard`, then every API call 401s (stranding the user instead of redirecting). Harden by checking the token's `exp` claim, and/or treat a 401 response as "clear token + redirect to /login". Not a breach — a correctness/UX bug.

### Security — before public deploy
> Not urgent while the app is local-only; do these before hosting it anywhere public.
- [ ] **HTTPS everywhere in production.** A JWT sent over plain HTTP can be sniffed. Local HTTP is fine; ensure the deployed API + frontend are served over TLS (most hosts provide it free) and the app never talks to an `http://` API in prod.
- [ ] **Rate limiting on `/auth/login` and `/auth/register`.** Without it these are open to password brute-forcing and account-spam. Use .NET 9's built-in rate limiter (`builder.Services.AddRateLimiter(...)` + `app.UseRateLimiter()`), applied at least to the auth endpoints.
- [ ] **Move the JWT signing key out of `appsettings.Development.json` into a real secret store** for any deploy: .NET User Secrets is dev-only (`~/.microsoft/usersecrets/<UserSecretsId>/secrets.json`, set via `dotnet user-secrets set "Jwt:Key" "..."`); production should read it from environment variables. This key is the master key — a leak lets anyone forge tokens for any user.
- [ ] **Cloudinary uploads** (when `/photos` ships): use signed uploads (server-generated signature, not an unsigned preset), validate that the URL saved via `POST /api/workoutphoto` is actually a Cloudinary URL, and set size/format limits in Cloudinary.

### Future / Nice to Have
- [ ] GitHub-style activity graph on dashboard
- [ ] Pagination / infinite scroll on the `/log` Timeline (currently loads all entries at once; revisit if it gets slow)
- [ ] **Quick-select for the Workout `Type` field** on the entry form — curated chips/autocomplete (e.g. Push/Pull/Legs, or the user's recent types) instead of free typing. App-driven, not the browser's native autocomplete (which is disabled via `autocomplete="off"`). Keep `Type` freeform — this is a convenience layer, not enum validation (Architecture Rule #4). `MatChips` or `MatAutocomplete`.

---

## Assets
- Logo: `src/assets/logo3.png` (weight plate + IronDiary text) — primary logo in use
- Also present: `logo.png`, `logo2.png` (older versions)

---

## Dev Commands

**Backend** (run from `IronDiary.Api/`):
```bash
dotnet run                              # starts API on http://localhost:5092
dotnet ef migrations add <Name>        # new migration after model changes
dotnet ef database update              # apply migrations
dotnet build                           # build without running
```

**Frontend** (run from `IronDiary-Frontend/`):
```bash
ng serve                               # dev server on http://localhost:4200
ng build                               # production build
npm test                               # Karma + Jasmine unit tests
ng generate component pages/<name>     # generate new page component
```

---

## Git Workflow (enforce these)
1. **Size decides the flow:**
   - **Trivial / quick changes → commit straight to `main`, no branch, no PR.** Examples: typos, comment/doc tweaks, a one-line fix, a small style/CSS nudge, a config or version bump. These don't need review.
   - **Medium or larger changes → branch + PR.** Examples: a new feature or page, logic/behavior changes, anything touching multiple files, anything with new tests, or anything you'd want a second set of eyes on. These get reviewed via a PR.
   - When unsure which bucket a change falls in, treat it as medium and branch.
2. For branch + PR work: at the **start** of the task create a branch off `main` before the first commit. Naming: `feature/<short-desc>` for new work, `fix/<short-desc>` for bug fixes (e.g. `fix/streak-rest-days`).
3. `git switch -c <branch>` carries uncommitted changes onto the new branch, so it's fine to branch even after editing — just always branch before the first commit.
4. Commit on the branch, push with `git push -u origin <branch>`, then open a PR for review (use `gh pr create`). Do not merge to `main` without the user's go-ahead.
5. Only commit/push when the user asks.

---

## Architecture Rules (enforce these)
1. Never return raw EF model instances from controllers — always map to a DTO
2. Never pass EF models to/from Angular — use the TypeScript interfaces in `core/models/`
3. All data is user-scoped — always filter by the authenticated user's ID
4. `WorkoutLog.Type` is freeform — do not add enum validation or restrict values
5. Related DTOs live in the same `.cs` file (e.g., `WorkoutLogDto`, `CreateWorkoutLogDto`, `WorkoutLogDetailDto` are all in `WorkoutLogDto.cs`)
6. Do not manually edit files in `Migrations/`
7. New Angular components default to standalone — do not add NgModule declarations
