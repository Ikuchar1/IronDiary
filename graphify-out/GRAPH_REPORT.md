# Graph Report - IronDiary  (2026-06-18)

## Corpus Check
- 114 files · ~257,240 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 674 nodes · 958 edges · 56 communities (39 shown, 17 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `512dd5f1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Entry Detail Page (vieweditdelete)|Entry Detail Page (view/edit/delete)]]
- [[_COMMUNITY_Bodyweight Page & Chart|Bodyweight Page & Chart]]
- [[_COMMUNITY_App Shell, Routing & Auth Guard|App Shell, Routing & Auth Guard]]
- [[_COMMUNITY_Frontend npm Dependencies|Frontend npm Dependencies]]
- [[_COMMUNITY_Angular BuildServe Config|Angular Build/Serve Config]]
- [[_COMMUNITY_EF Core Migrations|EF Core Migrations]]
- [[_COMMUNITY_Auth & Photo Controllers|Auth & Photo Controllers]]
- [[_COMMUNITY_BodyWeightRestDay API Tests|BodyWeight/RestDay API Tests]]
- [[_COMMUNITY_WorkoutLog Controller|WorkoutLog Controller]]
- [[_COMMUNITY_RestDay Controller|RestDay Controller]]
- [[_COMMUNITY_Solution & NuGet Packages|Solution & NuGet Packages]]
- [[_COMMUNITY_BodyWeightLog Controller|BodyWeightLog Controller]]
- [[_COMMUNITY_WorkoutLog API Tests|WorkoutLog API Tests]]
- [[_COMMUNITY_API Launch Settings|API Launch Settings]]
- [[_COMMUNITY_Test Web Application Factory|Test Web Application Factory]]
- [[_COMMUNITY_Angular Workspace Config|Angular Workspace Config]]
- [[_COMMUNITY_Frontend README & Conventions|Frontend README & Conventions]]
- [[_COMMUNITY_Entry Form Component|Entry Form Component]]
- [[_COMMUNITY_Same-Day Rules Helper|Same-Day Rules Helper]]
- [[_COMMUNITY_Streak & Date ADRs (0001-0003)|Streak & Date ADRs (0001-0003)]]
- [[_COMMUNITY_Confirm Dialog Component|Confirm Dialog Component]]
- [[_COMMUNITY_Streak Calculation Util|Streak Calculation Util]]
- [[_COMMUNITY_EF Model Snapshot|EF Model Snapshot]]
- [[_COMMUNITY_BodyweightPhoto ADRs (0004-0006)|Bodyweight/Photo ADRs (0004-0006)]]
- [[_COMMUNITY_Primary Logo Branding (logo3)|Primary Logo Branding (logo3)]]
- [[_COMMUNITY_WorkoutLog DTOs|WorkoutLog DTOs]]
- [[_COMMUNITY_Migration InitialCreation|Migration: InitialCreation]]
- [[_COMMUNITY_Migration AddInitialModels|Migration: AddInitialModels]]
- [[_COMMUNITY_Migration WorkoutPhoto Nav|Migration: WorkoutPhoto Nav]]
- [[_COMMUNITY_Migration AddIdentity|Migration: AddIdentity]]
- [[_COMMUNITY_Migration AddUserId|Migration: AddUserId]]
- [[_COMMUNITY_Old Logo Branding (logo)|Old Logo Branding (logo)]]
- [[_COMMUNITY_AppDbContext|AppDbContext]]
- [[_COMMUNITY_Alt Logo Branding (logo2)|Alt Logo Branding (logo2)]]
- [[_COMMUNITY_BodyWeightLog DTOs|BodyWeightLog DTOs]]
- [[_COMMUNITY_RestDay DTOs|RestDay DTOs]]
- [[_COMMUNITY_WorkoutPhoto DTOs|WorkoutPhoto DTOs]]
- [[_COMMUNITY_AppUser Identity Model|AppUser Identity Model]]
- [[_COMMUNITY_Auth UI Templates|Auth UI Templates]]
- [[_COMMUNITY_Login DTO|Login DTO]]
- [[_COMMUNITY_Register DTO|Register DTO]]
- [[_COMMUNITY_Dev Environment Config|Dev Environment Config]]
- [[_COMMUNITY_Program Startup|Program Startup]]
- [[_COMMUNITY_BodyWeightLog Model|BodyWeightLog Model]]
- [[_COMMUNITY_RestDay Model|RestDay Model]]
- [[_COMMUNITY_WorkoutLog Model|WorkoutLog Model]]
- [[_COMMUNITY_WorkoutPhoto Model|WorkoutPhoto Model]]
- [[_COMMUNITY_Confirm Dialog Template|Confirm Dialog Template]]
- [[_COMMUNITY_Footer Template|Footer Template]]
- [[_COMMUNITY_Root README|Root README]]
- [[_COMMUNITY_Index HTML Host Page|Index HTML Host Page]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]

## God Nodes (most connected - your core abstractions)
1. `AuthService` - 17 edges
2. `WorkoutLogService` - 17 edges
3. `RestDayService` - 16 edges
4. `BodyweightComponent` - 16 edges
5. `WorkoutLogTests` - 15 edges
6. `BodyWeightService` - 14 edges
7. `IronDiary — Project Context - Last Updated June 12th 2026` - 14 edges
8. `EntryDetailComponent` - 13 edges
9. `EntryFormComponent` - 13 edges
10. `RestDayTests` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Per-user Data Isolation` --rationale_for--> `Workout Log (domain term)`  [INFERRED]
  .kiro/steering/product.md → CONTEXT.md
- `IronDiary Frontend README` --references--> `Angular 19 Frontend`  [INFERRED]
  IronDiary-Frontend/README.md → .kiro/steering/tech.md
- `ADR-0005: Workout photos are an independent resource; edits commit live` --semantically_similar_to--> `Dual-write, no-transaction, no-rollback pattern (entry first, weight second)`  [INFERRED] [semantically similar]
  docs/adr/0005-workout-photos-are-an-independent-resource.md → docs/adr/0004-bodyweight-log-piggybacks-on-the-entry-form.md
- `DashboardComponent` --references--> `WorkoutLogDto`  [EXTRACTED]
  IronDiary-Frontend/src/app/pages/dashboard/dashboard.component.ts → IronDiary-Frontend/src/app/core/models/workout-log.model.ts
- `Frontend Conventions` --conceptually_related_to--> `Angular 19 Frontend`  [INFERRED]
  .kiro/steering/structure.md → .kiro/steering/tech.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Journal Entry composed of Workout Log and Rest Day** — context_md_journal_entry, context_md_workout_log, context_md_rest_day, context_md_timeline [EXTRACTED 0.90]
- **Streak and Gym Sessions derived from Journal Entries** — context_md_streak, context_md_gym_sessions, context_md_journal_entry, context_md_workout_log [EXTRACTED 0.85]
- **Log page edit/view flow** — log_log_component, entry_detail_entry_detail_component, entry_form_entry_form_component [EXTRACTED 0.85]
- **Authentication UI flow (login/register navigation cycle via navbar)** — login_login_component_template, register_register_component_template, navbar_navbar_component_template [EXTRACTED 0.85]
- **Day-grained date semantics across streak, override, and local formatting** — adr_0001_streak_rest_days, adr_0002_workout_overrides_rest_day, adr_0003_local_date_formatting [EXTRACTED 0.85]
- **Related-resource-written-separately boundary (bodyweight, photos, upload signing)** — adr_0004_bodyweight_piggybacks_entry_form, adr_0005_workout_photos_independent_resource, adr_0006_cloudinary_signed_uploads [EXTRACTED 0.85]

## Communities (56 total, 17 thin omitted)

### Community 0 - "Entry Detail Page (view/edit/delete)"
Cohesion: 0.07
Nodes (15): EntryDetailComponent, EntryFormComponent, environment, LogComponent, JournalEntry, CreateRestDayDto, RestDayDto, CreateWorkoutLogDto (+7 more)

### Community 1 - "Bodyweight Page & Chart"
Cohesion: 0.06
Nodes (15): BodyweightComponent, ConfirmDialogComponent, ConfirmDialogData, Bodyweight Log (domain term), DashboardComponent, BodyWeightLogDto, CreateBodyWeightLogDto, BodyWeightService (+7 more)

### Community 2 - "App Shell, Routing & Auth Guard"
Cohesion: 0.08
Nodes (12): AppComponent, appConfig, routes, app-footer, app-navbar, FooterComponent, authGuard(), authInterceptor() (+4 more)

### Community 3 - "Frontend npm Dependencies"
Cohesion: 0.05
Nodes (37): dependencies, @angular/cdk, @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/material, @angular/platform-browser (+29 more)

### Community 4 - "Angular Build/Serve Config"
Cohesion: 0.07
Nodes (33): build, extract-i18n, serve, test, builder, configurations, defaultConfiguration, options (+25 more)

### Community 5 - "EF Core Migrations"
Cohesion: 0.08
Nodes (16): MigrationBuilder, MigrationBuilder, MigrationBuilder, MigrationBuilder, MigrationBuilder, Migration, InitialCreation, IronDiary.Api.Migrations (+8 more)

### Community 6 - "Auth & Photo Controllers"
Cohesion: 0.11
Nodes (18): ControllerBase, AuthController, WorkoutPhotoController, CreateWorkoutPhotoDto, IConfiguration, AppUser, HttpPost, IActionResult (+10 more)

### Community 7 - "BodyWeight/RestDay API Tests"
Cohesion: 0.16
Nodes (9): IClassFixture, BodyWeightLogTests, Fact, IronDiaryApiFactory, Task, Fact, IronDiaryApiFactory, Task (+1 more)

### Community 8 - "WorkoutLog Controller"
Cohesion: 0.14
Nodes (15): WorkoutLogController, CreateWorkoutLogDto, ActionResult, AppDbContext, DateTime, HttpDelete, HttpGet, HttpPost (+7 more)

### Community 9 - "RestDay Controller"
Cohesion: 0.17
Nodes (13): RestDayController, CreateRestDayDto, ActionResult, AppDbContext, HttpDelete, HttpGet, HttpPost, HttpPut (+5 more)

### Community 10 - "Solution & NuGet Packages"
Cohesion: 0.11
Nodes (19): IronDiary.Api, net9.0, IronDiary.Api.Tests, net9.0, coverlet.collector (6.0.2), Microsoft.AspNetCore.Authentication.JwtBearer (9.0.0), Microsoft.AspNetCore.Identity.EntityFrameworkCore (9.0.0), Microsoft.AspNetCore.Mvc.Testing (9.0.0) (+11 more)

### Community 11 - "BodyWeightLog Controller"
Cohesion: 0.17
Nodes (12): BodyWeightLogDto, BodyWeightLogController, CreateBodyWeightLogDto, ActionResult, AppDbContext, HttpDelete, HttpGet, HttpPost (+4 more)

### Community 12 - "WorkoutLog API Tests"
Cohesion: 0.28
Nodes (4): Fact, IronDiaryApiFactory, Task, WorkoutLogTests

### Community 13 - "API Launch Settings"
Cohesion: 0.13
Nodes (15): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, applicationUrl, commandName (+7 more)

### Community 14 - "Test Web Application Factory"
Cohesion: 0.14
Nodes (9): HttpClient, IHost, IHostBuilder, Task, IronDiaryApiFactory, IWebHostBuilder, Program, SqliteConnection (+1 more)

### Community 15 - "Angular Workspace Config"
Cohesion: 0.15
Nodes (12): prefix, projectType, root, schematics, sourceRoot, newProjectRoot, projects, IronDiary-Frontend (+4 more)

### Community 16 - "Frontend README & Conventions"
Cohesion: 0.09
Nodes (22): IronDiary Frontend README, AppDbContext, Backend, Backend Conventions, Backend — IronDiary.Api/, Conventions, DTO Layer, Frontend (+14 more)

### Community 17 - "Entry Form Component"
Cohesion: 0.07
Nodes (29): Architecture Rules (enforce these), Assets, Backend — IronDiary.Api, Backend Key Patterns, Backlog / Next Steps, Chores / Refactors, Controller Endpoints, Dev Commands (+21 more)

### Community 18 - "Same-Day Rules Helper"
Cohesion: 0.36
Nodes (5): AppDbContext, DateTime, Task, SameDayRules, string

### Community 19 - "Streak & Date ADRs (0001-0003)"
Cohesion: 0.20
Nodes (9): Gym Sessions sub-stat (raw non-deduped Workout Log count), ADR-0001: Streak counts Rest Days, day-grained, with Gym-Sessions sub-stat, Shared same-day invariant helper (create/edit paths), A Workout Log overrides a Rest Day on the same date, Consequences, Considered Options, ADR-0003: Frontend formats entry dates from local calendar parts, not toISOString(), toLocalDateString helper (core/utils) (+1 more)

### Community 20 - "Confirm Dialog Component"
Cohesion: 0.14
Nodes (12): Gym Sessions during streak (domain term), Journal Entry (domain term), Photo (domain term), Rest Day (domain term), Streak (domain term), Timeline (domain term), Type (domain term), Workout Log (domain term) (+4 more)

### Community 21 - "Streak Calculation Util"
Cohesion: 0.25
Nodes (7): Additional Resources, Building, Code scaffolding, Development server, IronDiaryFrontend, Running end-to-end tests, Running unit tests

### Community 22 - "EF Model Snapshot"
Cohesion: 0.33
Nodes (4): ModelBuilder, AppDbContextModelSnapshot, IronDiary.Api.Migrations, ModelSnapshot

### Community 23 - "Bodyweight/Photo ADRs (0004-0006)"
Cohesion: 0.50
Nodes (5): ADR-0004: Bodyweight Log created from entry form, but not a Journal Entry, Dual-write, no-transaction, no-rollback pattern (entry first, weight second), ADR-0005: Workout photos are an independent resource; edits commit live, ADR-0006: Cloudinary signed uploads via a generic upload-signature endpoint, Generic POST /api/upload/signature (UploadController)

### Community 24 - "Primary Logo Branding (logo3)"
Cohesion: 0.50
Nodes (5): IronDiary Brand Identity, Brand Color Palette (cyan #00BCD4 / orange #f98e39), Dumbbell / Weight Plate Motif, IronDiary Primary Logo (logo3.png), Upward Progress Arrow Motif

### Community 25 - "WorkoutLog DTOs"
Cohesion: 0.40
Nodes (4): CreateWorkoutLogDto, WorkoutLogDetailDto, WorkoutLogDto, WorkoutLogWriteResultDto

### Community 26 - "Migration: InitialCreation"
Cohesion: 0.40
Nodes (3): ModelBuilder, InitialCreation, IronDiary.Api.Migrations

### Community 27 - "Migration: AddInitialModels"
Cohesion: 0.40
Nodes (3): ModelBuilder, AddInitialModels, IronDiary.Api.Migrations

### Community 28 - "Migration: WorkoutPhoto Nav"
Cohesion: 0.40
Nodes (3): ModelBuilder, AddWokroutPhotoObjectNavigation, IronDiary.Api.Migrations

### Community 29 - "Migration: AddIdentity"
Cohesion: 0.40
Nodes (3): ModelBuilder, AddIdentity, IronDiary.Api.Migrations

### Community 30 - "Migration: AddUserId"
Cohesion: 0.40
Nodes (3): ModelBuilder, AddUserIdToModels, IronDiary.Api.Migrations

### Community 31 - "Old Logo Branding (logo)"
Cohesion: 0.83
Nodes (4): IronDiary Brand Identity, IronDiary Logo (logo.png), Upward Progress Arrow Motif, Weight Plate Visual Motif

### Community 32 - "AppDbContext"
Cohesion: 0.50
Nodes (3): AppDbContext, IdentityDbContext, AppUser

### Community 33 - "Alt Logo Branding (logo2)"
Cohesion: 0.67
Nodes (3): IronDiary Logo (logo2 — Dumbbell-Arrow Mark), IronDiary Brand Identity, Cyan/Orange Dark Theme Palette

### Community 38 - "Auth UI Templates"
Cohesion: 1.00
Nodes (3): Login component template, Navbar component template, Register component template

### Community 51 - "Community 51"
Cohesion: 0.50
Nodes (3): Consequences, Considered Options, Streak counts Rest Days and is day-grained, with a separate Gym-Sessions sub-stat

### Community 52 - "Community 52"
Cohesion: 0.50
Nodes (3): Consequences, Frontend formats entry dates from local calendar parts, not `toISOString()`, Reading dates back (display)

### Community 53 - "Community 53"
Cohesion: 0.50
Nodes (3): A Bodyweight Log is created from the entry form, but is not a Journal Entry, Consequences, Considered Options

### Community 54 - "Community 54"
Cohesion: 0.50
Nodes (3): Core Features, IronDiary - Product Overview, Users

## Knowledge Gaps
- **240 isolated node(s):** `$schema`, `version`, `newProjectRoot`, `projectType`, `style` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WorkoutLogController` connect `WorkoutLog Controller` to `Auth & Photo Controllers`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `newProjectRoot` to the rest of the system?**
  _241 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Entry Detail Page (view/edit/delete)` be split into smaller, more focused modules?**
  _Cohesion score 0.06862745098039216 - nodes in this community are weakly interconnected._
- **Should `Bodyweight Page & Chart` be split into smaller, more focused modules?**
  _Cohesion score 0.061016949152542375 - nodes in this community are weakly interconnected._
- **Should `App Shell, Routing & Auth Guard` be split into smaller, more focused modules?**
  _Cohesion score 0.08013937282229965 - nodes in this community are weakly interconnected._
- **Should `Frontend npm Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `Angular Build/Serve Config` be split into smaller, more focused modules?**
  _Cohesion score 0.07386363636363637 - nodes in this community are weakly interconnected._