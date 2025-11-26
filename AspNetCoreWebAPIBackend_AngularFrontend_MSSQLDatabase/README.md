# 🚀 ASP.NET Core Web API Beginner Guide

![.NET 8](https://img.shields.io/badge/.NET-8.0-purple?style=flat&logo=dotnet)
![EF Core](https://img.shields.io/badge/EF%20Core-Entity%20Framework-blue?style=flat)
![SQL Server](https://img.shields.io/badge/SQL%20Server-Database-red?style=flat)
![Status](https://img.shields.io/badge/Status-Active-success)

A simple, step-by-step guide to building a RESTful Web API using **.NET 8**, **Entity Framework Core**, and **SQL Server**. This project demonstrates how to set up a database connection, create models, and expose API endpoints for basic data operations.



[Image of ASP.NET Core Web API architecture]


---

## 📋 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Docker Support](#-docker-support)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [License](#-license)

---

## ✨ Features

* **RESTful API Architecture**: Built on the latest .NET 8 framework.
* **Entity Framework Core**: Code-first approach for database management.
* **SQL Server Integration**: Persistent data storage.
* **Swagger UI**: Built-in interactive documentation for testing endpoints.
* **Async/Await**: Asynchronous programming for better performance.

---

## 🛠 Technologies Used

* **Framework:** ASP.NET Core 8
* **Language:** C#
* **Database:** Microsoft SQL Server
* **ORM:** Entity Framework Core
* **IDE:** Visual Studio 2022

---

## ⚙️ Prerequisites

Before running this project, ensure you have the following installed:

1.  **[Visual Studio 2022](https://visualstudio.microsoft.com/)** (with ASP.NET and web development workload).
2.  **[.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)**.
3.  **SQL Server** (LocalDB or a remote instance) & SSMS (optional).

---

## 📂 Project Structure

```text
AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase/
├── Controllers/
│   ├── LoginsController.cs       # Issues JWTs for interactive login
│   └── UsersController.cs        # Protected CRUD endpoints for users
├── Models/
│   ├── ApplicationDbContext.cs   # EF Core DbContext (logins & users sets)
│   ├── login.cs                  # Login entity persisted in SQL Server
│   ├── user.cs                   # User entity persisted in SQL Server
│   ├── LoginRequestDto.cs        # DTO for /api/login
│   └── UserRequestDto.cs         # DTO for /api/user endpoints
├── Migrations/                   # EF Core migrations history
├── Program.cs                    # ASP.NET Core bootstrap + DI wiring
├── appsettings.json              # Connection string + JWT config
├── docker-compose.yml            # Full stack orchestration
└── README.md
```

---

## 🧭 Controllers & Request Payloads

### `LoginsController`
- **Endpoint:** `POST /api/login`
- **Description:** Validates a stored login record and returns a signed JWT.
- **Request body:**

```json
{
  "username": "admin",
  "password": "admin"
}
```

### `UsersController` (JWT protected)
- **Endpoints:**
  - `GET /api/user` – list all users
  - `GET /api/user/{id}` – fetch a single user
  - `POST /api/user` – create a user
  - `PUT /api/user/{id}` – update a user
  - `DELETE /api/user/{id}` – remove a user
- **Request/response contract:** every call requires an `Authorization: Bearer <token>` header issued by `POST /api/login`.
- **Create/Update body:**

```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com"
}
```

# 🚀 Installation & Setup

Follow these steps to get the project running on your local machine.

## Step 1: Clone or Create the Project

Open Visual Studio 2022 and create a new ASP.NET Core Web API project using .NET 8.

## Step 2: Install NuGet Packages

Open the Package Manager Console (`Tools -> NuGet Package Manager -> Package Manager Console`) and run:

```
Install-Package Microsoft.EntityFrameworkCore.SqlServer
Install-Package Microsoft.EntityFrameworkCore.Tools
```

## Step 3: Configure Database Connection

Open `appsettings.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=AspNetCoreWebAPI;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "X8v!pQz$7s@Lk#2bT9wR^eF6uHjZxC1m",
    "Issuer": "AspNetCoreWebAPIBackend",
    "Audience": "AngularFrontend"
  }
}
```

> **Note:** Replace `YOUR_SERVER` with your SQL Server instance (e.g., `(localdb)\\MSSQLLocalDB`, `localhost`, or the containerized SQL Server from `docker-compose.yml`).

## Step 4: Create Database Context

Ensure your `Program.cs` is configured to use SQL Server:

```csharp
using Microsoft.EntityFrameworkCore;
using YourNamespace.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

### `ApplicationDbContext` Shape

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<login> logins { get; set; }
    public DbSet<user> users { get; set; }
}
```

## Step 5: Run Migrations

Create the database and tables automatically by running these commands in the Package Manager Console:

```
Add-Migration InitialCreate
Update-Database
```

---

# 🐳 Docker Support

Run the entire application (Backend, Frontend, and Database) using Docker.

## Step 1: Install Docker
Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

## Step 2: Configure Environment Variables
Create a file named `.env` in the root directory (`AspNetCoreWebAPIBackend_AngularFrontend_MSSQLDatabase/`) and add the following content:

```env
DB_PASSWORD=12345
DB_USER=sa
DB_NAME=AspNetCoreWebAPI_DemoDB
JWT_KEY=X8v!pQz$7s@Lk#2bT9wR^eF6uHjZxC1m
JWT_ISSUER=AspNetCoreWebAPIBackend
JWT_AUDIENCE=AngularFrontend
SA_PASSWORD=12345
```

## Step 3: Run the Application
Open a terminal in the root directory and run:

```bash
docker-compose up --build
```

### Prefer building manually?
If you want to see the individual Docker commands instead of letting Compose do everything:

```bash
# 1. Build the backend image using the Dockerfile
docker build -t aspnetcore-app .

# 2. Run the backend container on port 5000
docker run -p 5000:8080 --env-file .env aspnetcore-app
```

### docker-compose essentials

```bash
# Rebuild images whenever something changes
docker-compose build

# Start the stack (backend + Angular + SQL Server)
docker-compose up

# Run in detached mode so the terminal is free
docker-compose up -d

# Stop everything
docker-compose down
```

## Step 4: Access the App
- **Frontend:** [http://localhost:4200](http://localhost:4200)
- **Backend API:** [http://localhost:5000/swagger](http://localhost:5000/swagger)
- **SQL Server:** `localhost,1433` (User: `sa`, Password: `12345`)

---

# 🎮 Usage

- **Run the Application:** Press F5 or click the Run button in Visual Studio.
- **Swagger UI:** The browser will automatically open to the Swagger interface (usually `https://localhost:7xxx/swagger`).
- **Test Endpoints:** You can execute API calls directly from the Swagger UI.

---

# 📡 API Endpoints

## Auth & User Management

| Method | Endpoint          | Description                                  |
|--------|------------------|----------------------------------------------|
| POST   | `/api/login`     | Validates credentials and returns a JWT.     |
| GET    | `/api/user`      | Returns every stored user (requires JWT).    |
| GET    | `/api/user/{id}` | Returns one user by id (requires JWT).       |
| POST   | `/api/user`      | Creates a user (requires JWT, JSON body).    |
| PUT    | `/api/user/{id}` | Updates user fields (requires JWT, body).    |
| DELETE | `/api/user/{id}` | Deletes a user record (requires JWT).        |

> Include the JSON bodies referenced in the controller section above when calling the POST/PUT endpoints.

---
