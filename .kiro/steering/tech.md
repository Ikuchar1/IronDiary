# Tech Stack

## Backend — IronDiary.Api

- .NET 9 / ASP.NET Core Web API
- Entity Framework Core 9 with Npgsql (PostgreSQL)
- ASP.NET Core Identity for user management
- JWT Bearer authentication (`Microsoft.AspNetCore.Authentication.JwtBearer`)
- Swagger / Swashbuckle for API docs
- Nullable reference types enabled, implicit usings enabled

## Frontend — IronDiary-Frontend

- Angular 19 (standalone components, functional guards/interceptors)
- Angular Material 19 (UI components)
- Angular CDK
- RxJS 7.8
- TypeScript 5.7
- SCSS for styles

## Common Commands

### Backend
```bash
# Run the API (from IronDiary.Api/)
dotnet run

# Apply EF migrations
dotnet ef database update

# Add a new migration
dotnet ef migrations add <MigrationName>

# Build
dotnet build
```

### Frontend
```bash
# Install dependencies (from IronDiary-Frontend/)
npm install

# Dev server (http://localhost:4200)
npm start

# Build
npm run build

# Run tests
npm test
```

## Configuration

- Backend API runs on `http://localhost:5092` by default
- Frontend dev server runs on `http://localhost:4200`
- CORS is configured to allow `http://localhost:4200`
- JWT config lives in `appsettings.json` under `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`
- DB connection string is `ConnectionStrings:DefaultConnection` in `appsettings.json`
