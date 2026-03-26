# Project Structure

## Root
```
IronDiary.sln              # Solution file
IronDiary.Api/             # .NET backend
IronDiary-Frontend/        # Angular frontend
```

## Backend — IronDiary.Api/
```
Controllers/               # API controllers, one per resource
  AuthController.cs        # Register/login, JWT issuance
  WorkoutLogController.cs
  BodyWeightLogController.cs
  RestDayController.cs
  WorkoutPhotoController.cs
Data/
  AppDbContext.cs           # EF Core DbContext (extends IdentityDbContext<AppUser>)
Models/                    # EF entity classes (no namespace, implicit usings)
  AppUser.cs               # Extends IdentityUser
  WorkoutLog.cs
  BodyWeightLog.cs
  RestDay.cs
  WorkoutPhoto.cs
DTOs/                      # Request/response shapes (LoginDto, RegisterDto)
Migrations/                # EF Core auto-generated migrations
Program.cs                 # App bootstrap, service registration, middleware pipeline
appsettings.json           # JWT + DB config
```

## Frontend — IronDiary-Frontend/src/app/
```
app.routes.ts              # Route definitions
app.config.ts              # App-level providers (router, HttpClient, interceptors)
core/
  guards/                  # Functional route guards (auth.guard.ts)
  interceptors/            # Functional HTTP interceptors (auth.intercepter.ts)
  services/                # Singleton services (auth.service.ts)
pages/                     # Feature page components (one folder per route)
  home/
  login/
  register/
  dashboard/
shared/
  components/              # Reusable UI components (navbar, footer)
styles/
  _variables.scss          # Global SCSS variables
```

## Conventions

### Backend
- Controllers use `[ApiController]`, `[Route("api/[controller]")]`, and return `IActionResult`
- All resource controllers use `[Authorize]`; user identity extracted via `User.FindFirstValue(ClaimTypes.NameIdentifier)`
- Models live at the root namespace (no explicit namespace declarations)
- DTOs are separate classes in `DTOs/` — not reusing entity models for requests
- EF queries use async/await throughout (`ToListAsync`, `SaveChangesAsync`, etc.)
- JSON cycle handling is configured globally via `ReferenceHandler.IgnoreCycles`

### Frontend
- Standalone components only — no NgModules
- Services are `providedIn: 'root'` singletons
- HTTP interceptors and guards are functional (not class-based)
- JWT token stored in `localStorage`, attached via `authInterceptor`
- API base URL is hardcoded in each service (`http://localhost:5092/api/...`)
- Component styles use `.css` or `.scss` per component; global variables in `src/styles/_variables.scss`
- New pages go in `src/app/pages/<feature>/`, shared UI in `src/app/shared/components/`
