## Overview

This repository contains a full-stack demo application with:

- **Backend**: ASP.NET Core 8 Web API with Entity Framework Core and JWT authentication.
- **Frontend**: Angular 20 SPA, built and served via **Nginx**.
- **Database**: Microsoft SQL Server 2022 (Developer Edition).
- **Container Orchestration**: `docker-compose` for running all services together.

The goal is to provide a clean, production-style container setup suitable for running locally with Docker Desktop and for publishing on GitHub.

---

## Quick Start (TL;DR)

1. **Clone** this repository.
2. **Create/verify** a `.env` file in the root directory:

   ```text
   SA_PASSWORD=StrongP@ssw0rd!2025
   ConnectionStrings__DefaultConnection=Server=mssql;Database=AspNetCoreWebAPI_DemoDB;User Id=sa;Password=StrongP@ssw0rd!2025;TrustServerCertificate=True;Encrypt=False;
   ```

3. **Run all containers in detached mode**:

   ```bash
   docker compose up --build -d
   ```

4. **Open in the browser**:
   - `http://localhost:4200` – Angular frontend.
   - `http://localhost:5000` – ASP.NET Core backend (Swagger / API).

5. **Optional**: connect to SQL Server from SSMS or another client at `localhost,14333` (user: `sa`, password from `.env`).

---

## Project Structure

- **Backend** (`AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase/`)
  - `Program.cs` – ASP.NET Core startup and middleware pipeline.
  - `Controllers/`
    - `UsersController.cs` – User CRUD endpoints.
    - `LoginsController.cs` – Authentication / login endpoints.
  - `Models/`
    - `ApplicationDbContext.cs` – Entity Framework Core `DbContext`.
    - `user.cs`, `login.cs` – Entity models.
    - `UserRequestDto.cs`, `LoginRequestDto.cs` – DTOs used by the API.
  - `Migrations/` – EF Core migrations for creating and updating the database schema.
  - `appsettings.json` – Default configuration (logging, connection string, JWT settings).
  - `AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.csproj` – .NET project file, NuGet dependencies.
  - `Dockerfile` – Multi-stage Docker build for the backend API.
  - `.dockerignore` – Excludes build artifacts and local-only files from the Docker build context.

- **Frontend** (`AngularFrontend/`)
  - `src/`
    - `main.ts`, `app/` – Angular bootstrap and main application module/component.
    - `app/login/` – Login page module, components, and styles.
    - `app/user/` – User listing / details components.
    - `app/models/` – TypeScript models for login and user entities.
    - `app/services/`
      - `auth.service.ts` – JWT token handling, session utilities.
      - `login.service.ts`, `user.service.ts` – HTTP services calling the backend API.
      - `toast.service.ts` – UI notifications.
    - `environments/environments.ts` – Frontend API configuration (see notes below).
  - `angular.json` – Angular workspace and build configuration.
  - `package.json` – NPM dependencies and scripts.
  - `nginx.conf` – Nginx configuration used inside the frontend container:
    - Serves the Angular build output.
    - Proxies `/api/*` requests to the backend container.
  - `Dockerfile` – Multi-stage Docker build to compile Angular and serve it via Nginx.
  - `.dockerignore` – Excludes `node_modules`, `dist`, and editor files from Docker builds.

- **Root**
  - `docker-compose.yml` – Defines three services: `mssql`, `backend`, and `frontend`.
  - `.env` – Environment variables for Docker Compose (SA password and connection string).
  - `.gitignore` / `.dockerignore` – Global ignore rules for Git and Docker contexts.

---

## Prerequisites

- **Docker Desktop** (Windows, macOS, or Linux with Docker Engine & Compose).
- **Git** (to clone the repository).
- Optional locally installed tools:
  - .NET 8 SDK
  - Node.js 20 and npm

Everything can be run with Docker alone; the SDKs are only necessary for local, non-container builds.

---

## Configuration

### 1. Environment file (`.env`)

At the root of the repository (beside `docker-compose.yml`), create a `.env` file if it does not already exist:

```text
SA_PASSWORD=StrongP@ssw0rd!2025
ConnectionStrings__DefaultConnection=Server=mssql;Database=AspNetCoreWebAPI_DemoDB;User Id=sa;Password=StrongP@ssw0rd!2025;TrustServerCertificate=True;Encrypt=False;
```

Notes:

- `SA_PASSWORD` must meet SQL Server complexity requirements.
- `ConnectionStrings__DefaultConnection` is the connection string used by the ASP.NET Core backend via configuration binding.
- `.gitignore` includes `.env` so secrets do **not** get committed.

### 2. Frontend environment (`environments.ts`)

For a containerized setup, a simple and robust pattern is to let the browser call Nginx on the same origin and let Nginx proxy `/api` traffic to the backend:

```ts
// AngularFrontend/src/environments/environments.ts
export const environment = {
  production: false,
  api: {
    login: '/api/login',
    user: '/api/user'
  }
};
```

This means:

- In development with Docker, you browse to `http://localhost:4200`.
- The frontend calls `http://localhost:4200/api/...`, which Nginx proxies to the backend container (`backend:8080`).

---

## Docker Setup

### Services in `docker-compose.yml`

- **mssql**
  - Image: `mcr.microsoft.com/mssql/server:2022-latest`
  - Environment:
    - Reads `SA_PASSWORD` from `.env`.
    - Runs as Developer edition (`MSSQL_PID=Developer`).
  - Health check using `sqlcmd` to ensure SQL Server is ready.
  - Exposes host port `14333` → container `1433` (connect with SSMS/clients on `localhost,14333`).
  - Persists data in a named volume `mssql-data`.

- **backend**
  - Built from `AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase/Dockerfile`.
  - Environment:
    - `env_file: .env` imports `SA_PASSWORD` and `ConnectionStrings__DefaultConnection`.
    - `ASPNETCORE_ENVIRONMENT=Development`.
    - `ASPNETCORE_URLS=http://+:8080` (service listens on port `8080` inside the container).
  - Depends on `mssql` with a health check condition.
  - Exposes host port `5000` → container `8080` (API available at `http://localhost:5000`).

- **frontend**
  - Built from `AngularFrontend/Dockerfile` (Node build stage → Nginx runtime).
  - Serves the Angular SPA and proxies `/api` to the `backend` container.
  - Exposes host port `4200` → container `80` (UI available at `http://localhost:4200`).

---

## Running with Docker

### 1. Build and run (foreground)

From the repository root:

```bash
docker compose up --build
```

This will:

- Build the backend and frontend images (if not already built).
- Start `mssql`, `backend`, and `frontend` containers.
- Stream logs for all services to your terminal.

### 2. Build and run in detached mode

To run containers **in the background**:

```bash
docker compose up --build -d
```

or equivalently:

```bash
docker compose up -d --build
```

Key points:

- `--build` ensures images are rebuilt if you changed code.
- `-d` (detached) returns control to your shell immediately.
- To see logs after starting in detached mode:

  ```bash
  docker compose logs -f
  ```

### 3. Stopping and cleaning up

- **Stop containers but keep volumes and images**:

  ```bash
  docker compose down
  ```

- **Stop containers and remove volumes (including `mssql-data`)**:

  ```bash
  docker compose down -v
  ```

  Use this if you want to reset the database.

- **Rebuild images from scratch**:

  ```bash
  docker compose build --no-cache
  ```

---

## Backend Details

- **Framework**: ASP.NET Core 8.0.
- **Auth**: JWT, using `Microsoft.AspNetCore.Authentication.JwtBearer`.
- **Data Access**: Entity Framework Core 8 with SQL Server provider.
- **Migrations**: in `Migrations/`, applied at development time; in a production-ish setup you would:
  - Run `dotnet ef database update` inside the backend container or
  - Apply migrations on app startup via `context.Database.Migrate()` (if enabled).

### Backend Docker Image

The backend Dockerfile uses a multi-stage build:

1. **Build stage** (`mcr.microsoft.com/dotnet/sdk:8.0`):
   - Restores NuGet packages.
   - Publishes the application into `/app/publish`.
2. **Runtime stage** (`mcr.microsoft.com/dotnet/aspnet:8.0`):
   - Copies the published output.
   - Exposes port `8080`.

---

## Frontend Details

- **Framework**: Angular 20.
- **Build Tool**: `@angular/cli` via the `@angular/build` builder.
- **HTTP Calls**:
  - Use `HttpClient` with URLs from `environment.api`.
  - JWT is attached through `AuthService` and (optionally) an HTTP interceptor.

The frontend Dockerfile also uses a multi-stage build:

1. **Build stage** (`node:20-alpine`):
   - Installs dependencies with `npm ci`.
   - Builds the Angular app in production mode (`npm run build -- --configuration production`).
2. **Runtime stage** (`nginx:1.27-alpine`):
   - Copies `dist/my-app/browser` into `/usr/share/nginx/html`.
   - Uses `nginx.conf` to:
     - Serve the SPA.
     - Proxy `/api` to the backend container (`backend:8080`).

---

## Authentication & API Flow (High Level)

- The **frontend** login page sends credentials to the backend’s `/api/login` endpoint.
- On success, the backend issues a **JWT token** which is stored in the browser (via `AuthService`).
- The Angular app attaches this token to subsequent HTTP requests (e.g., `/api/user`), giving access to protected user operations.
- The **backend** validates the JWT on each incoming request using `Microsoft.AspNetCore.Authentication.JwtBearer`.
- The database (via `ApplicationDbContext`) stores user and login data; EF Core ensures strongly-typed access and migrations.

From the user’s point of view:

1. They open `http://localhost:4200`.
2. Log in via the Angular UI.
3. On success, the UI shows user data, which is served by the ASP.NET Core API, which in turn reads from SQL Server running in Docker.

---

## API Endpoints (Reference)

The backend exposes a small, JWT-protected REST API. You can find ready‑to‑run HTTP examples in:

- `AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase/AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.http`

Key endpoints (base URL is `http://localhost:5000` when running with Docker):

- **POST `/api/login`**
  - **Description**: Authenticates a user and returns a JWT token.
  - **Body**:
    ```json
    {
      "username": "admin",
      "password": "admin"
    }
    ```
  - **Response**:
    ```json
    {
      "token": "<jwt-token>"
    }
    ```

- **POST `/api/user`** (requires `Authorization: Bearer <token>`)
  - **Description**: Creates a new user.
  - **Body example**:
    ```json
    {
      "name": "newuser",
      "email": "newuser@gmail.com"
    }
    ```

- **GET `/api/user`** (requires `Authorization: Bearer <token>`)
  - **Description**: Returns the list of all users.

- **GET `/api/user/{id}`** (requires `Authorization: Bearer <token>`)
  - **Description**: Returns a single user by id.

- **PUT `/api/user/{id}`** (requires `Authorization: Bearer <token>`)
  - **Description**: Updates an existing user.
  - **Body example**:
    ```json
    {
      "name": "updated",
      "email": "updated@gmail.com"
    }
    ```

- **DELETE `/api/user/{id}`** (requires `Authorization: Bearer <token>`)
  - **Description**: Deletes a user by id.

You can open the `.http` file in IDEs like Visual Studio / VS Code / JetBrains Rider and execute the requests directly, or use the same payloads with tools such as Postman or curl.

---

## Local Development (Without Docker)

This is optional; Docker is the primary workflow.

- **Backend**:

  ```bash
  cd AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase
  dotnet restore
  dotnet run
  ```

  The API will typically run on `https://localhost:7270` / `http://localhost:5123` (depending on your launch profile).

- **Frontend**:

  ```bash
  cd AngularFrontend
  npm install
  npm start
  ```

  The SPA will run at `http://localhost:4200`. Adjust `environments.ts` to point to the local backend ports if you run without Docker.

---

## Troubleshooting

- **SQL password issues (`event not found`)**:
  - When typing `sqlcmd` manually in a shell, use single quotes or escape `!`:

  ```bash
  ./sqlcmd -S localhost -U sa -P 'StrongP@ssw0rd!2025' -C
  # or
  ./sqlcmd -S localhost -U sa -P "StrongP@ssw0rd\!2025" -C
  ```

- **Backend cannot connect to SQL Server**:
  - Confirm `ConnectionStrings__DefaultConnection` in `.env` matches the container host (`Server=mssql;`).
  - Make sure you did **not** add extra spaces or quotes in `.env`.

- **Frontend cannot reach API**:
  - Confirm `environment.api` points to `/api/...` and that Nginx is proxying correctly.
  - Ensure `frontend` and `backend` services are both running: `docker compose ps`.

---

## Running Summary

1. Clone the repo.
2. Create/verify `.env` at the root with `SA_PASSWORD` and `ConnectionStrings__DefaultConnection`.
3. From the root directory, run:

   ```bash
   docker compose up --build -d
   ```

4. Open:
   - `http://localhost:4200` – Angular frontend.
   - `http://localhost:5000` – ASP.NET Core backend (Swagger or API).
   - `localhost,14333` – SQL Server (connect using SSMS or another client).

This setup gives you a fully containerized, reproducible environment suitable for local development and demonstration on GitHub.

---

## Git & GitHub Commands

Typical workflow to publish this project to GitHub:

```bash
# 1. Initialize git (only once per project)
git init

# 2. Add all files and commit
git add .
git commit -m "first commit"

# 3. Rename default branch to main
git branch -M main

# 4. Add your GitHub remote (replace with your own URL if different)
git remote add origin https://github.com/furkanGitId/AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase.git

# 5. Push to GitHub and set upstream
git push -u origin main
```

After the first push, your day‑to‑day commands are usually:

```bash
# See what changed
git status

# Stage and commit changes
git add .
git commit -m "describe your change"

# Push to GitHub
git push
```
