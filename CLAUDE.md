# IronDiary — Project Context - Last Updated June 1st 2026

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
| RestDayController | GET /api/restday, POST /api/restday, GET /api/restday/{id}, DELETE /api/restday/{id} |

**Note: WorkoutLog is the only resource with a PUT endpoint so far (RestDay's is issue #7).** POST and PUT on WorkoutLog return `WorkoutLogWriteResultDto` (wraps the workout DTO + `OverrodeRestDay` flag, ADR-0002); PUT accepts the same body as create (`CreateWorkoutLogDto`) and returns 404 for nonexistent or other users' ids.

### Backend Key Patterns
- Controllers inject `AppDbContext` directly — no repository or service layer
- Raw EF models are never returned from controllers; always map to DTOs
- `WorkoutLogController.GetById` uses `.Include(w => w.Photos)` and returns `WorkoutLogDetailDto`
- List endpoints return the lightweight DTO (no photos included)
- All resources filtered by authenticated user's ID from JWT claims
- JSON configured with `ReferenceHandler.IgnoreCycles` to handle circular nav properties
- Swagger configured with Bearer auth for testing protected endpoints
- CORS currently only allows `http://localhost:4200`
- JWT config keys: `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience` (from appsettings / env vars)

### Known Backend Issues
- No UPDATE (PUT) endpoint on WorkoutPhoto, BodyWeightLog, or RestDay (RestDay's is issue #7)

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
│   │   │   ├── workout-log.model.ts   ← WorkoutPhotoDto, WorkoutLogDto, WorkoutLogDetailDto, CreateWorkoutLogDto
│   │   │   ├── body-weight.model.ts   ← BodyWeightLogDto, CreateBodyWeightLogDto
│   │   │   └── rest-day.model.ts      ← RestDayDto, CreateRestDayDto
│   │   └── services/
│   │       ├── auth.service.ts        ← login, register, logout, saveToken, getToken, isLoggedIn
│   │       ├── workout-log.service.ts ← getWorkoutLogs, createWorkoutLog, updateWorkoutLog, getWorkoutLogById, deleteWorkoutLog, getWorkoutLogsByDateRange
│   │       ├── body-weight.service.ts ← getAll() (confirmed from dashboard usage)
│   │       └── rest-day.service.ts
│   ├── pages/
│   │   ├── home/           ← public landing page (hero, features, how-it-works)
│   │   ├── login/          ← login form
│   │   ├── register/       ← register form
│   │   └── dashboard/      ← streak counter, most recent workout, latest bodyweight, recent activity list (5 logs), quick log button
│   └── shared/
│       └── components/
│           ├── navbar/
│           └── footer/
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

Routes still to build: `/log`, `/bodyweight`, `/photos`, `/profile`

### Frontend Key Patterns
- All components are standalone (no NgModules)
- Services: `@Injectable({ providedIn: 'root' })`, HttpClient injected, `apiUrl` built from `environment.apiUrl`
- Always import from `environment.ts` (not `environment.development.ts`) — Angular's build system handles the swap
- JWT stored in `localStorage` under key `'token'`, attached via functional interceptor
- `authGuard` is a functional guard (not class-based `CanActivate`)
- `authInterceptor` is a functional `HttpInterceptorFn`
- Angular Material used for UI components (MatCard, MatButton, MatList, MatChips, MatProgressSpinner confirmed in use)
- Pages use `.scss`; some older shared components still have `.css` files alongside (do not rename)

### Known Frontend Issues / Gotchas
- Production `apiUrl` in `environment.ts` is still a placeholder URL
- `WorkoutPhotoDto` is defined in `workout-log.model.ts` (not its own file)

---

## Pages Status
**Built:** home, login, register, dashboard
**To build:** log, bodyweight tracker (with chart), progress photo grid, profile
**Future:** GitHub-style activity graph on dashboard

---

## Backlog / Next Steps

> **Rule:** Once an item below is fully implemented, remove it from this list.

### In Progress — same-day rules + edit endpoints (backend, scoped 2026-06-11)
PRD: **GitHub issue #2** (see also CONTEXT.md + ADR-0002). Broken into vertical-slice issues, all labeled `ready-for-agent`:
- [x] #3 — integration test harness (`IronDiary.Api.Tests`, xUnit + WebApplicationFactory) — done, uncommitted
- [x] #4 — Rest Day creation on a workout date → 409; duplicates tolerated — done, uncommitted
- [x] #5 — Workout creation overrides same-date Rest Day + override indicator in `WorkoutLogWriteResultDto`; frontend service updated — done 2026-06-11, uncommitted
- [ ] **Commit #3/#4/#5/#6** — all four slices sit uncommitted on `feature/log-page`. Commit slice-by-slice so they stay reviewable (e.g. one commit for #3+#4, one for #5, one for #6); optionally `/review` first.
- [x] #6 — PUT workout log with same rules; CLAUDE.md "no PUT endpoints" notes updated — done 2026-06-11, uncommitted
- [ ] #7 — PUT rest day with same rules (blocked by #4)
- [ ] **Manual check — verify the day-grained queries against real PostgreSQL.** Why: the integration tests run on SQLite, but `SameDayRules.HasWorkoutLogOnDateAsync` AND `SameDayRules.OverrideRestDaysOnDateAsync` (added in #5) both use `.Date.Date == day`, and each EF provider translates `.Date` to SQL its own way — SQLite passing doesn't prove Npgsql/PostgreSQL handles it the same. How: start Postgres + API (`brew services start postgresql@14`, `dotnet run`), open Swagger at http://localhost:5092/swagger, authorize with a Bearer token, then check both directions: (1) `POST /api/workoutlog` with today's date at some morning time, then `POST /api/restday` for today at a *different* time → expect **409 Conflict** (different times, same calendar day = day-grained works). (2) `POST /api/restday` for tomorrow → expect 200, then `POST /api/workoutlog` for tomorrow at a *different* time → expect 200 with `overrodeRestDay: true`, and `GET /api/restday` shows tomorrow's Rest Day is gone. Remove this item once both are seen working.

### Pages to Build
- [ ] `/log` — **needs its own PRD before building** (write it next, after issue #2's slices land). Scope already agreed 2026-06-11:
  - Combined newest-first timeline of Journal Entries (Workout Logs + Rest Days)
  - Routes: `/log` (list), `/log/new` (form with Workout/Rest toggle), `/log/workout/:id`, `/log/rest/:id` (detail + edit)
  - Surfaces the override/409 messaging from issue #2's contracts (e.g. "this replaces your Rest Day")
  - Photos: detail view displays existing photos; upload waits for `/photos` + Cloudinary
- [ ] `/bodyweight` — log and chart bodyweight over time (uses `BodyWeightService`)
- [ ] `/photos` — progress photo grid (uses `WorkoutPhotoService`)
- [ ] `/profile` — user profile page

### Integrations
- [ ] **Cloudinary** photo hosting — free tier (25GB storage/bandwidth). Flow: user picks a photo on the frontend → upload directly to Cloudinary → get back a URL → save URL via `POST /api/workoutphoto`. No backend model changes needed, `WorkoutPhoto.Url` already stores a string URL. Tackle this when building the `/photos` page.

### Chores / Refactors
- [ ] Convert all remaining `.css` files to `.scss` (older shared components still use `.css`). When done, remove the "do not rename" note under Frontend Key Patterns.
- [ ] Write a nice `README.md` at the repo root — project overview, screenshots, tech stack, local setup/run instructions for both API and frontend.

### Future / Nice to Have
- [ ] GitHub-style activity graph on dashboard

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
