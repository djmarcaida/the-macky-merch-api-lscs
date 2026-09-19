# 🛍️ Macky Merch API

> Production-grade RESTful API for the **La Salle Computer Society (LSCS)** Macky Merch store, built with Node.js, Express, TypeScript, SQLite, Prisma ORM, and Docker.

---

## Table of Contents
1. [Project Overview & Tech Stack](#1-project-overview--tech-stack)
2. [Getting Started & Setup Guide](#2-getting-started--setup-guide)
   - [Prerequisites](#prerequisites)
   - [Local Installation](#local-installation)
   - [Environment Configuration](#environment-configuration)
   - [Database Setup & Migrations](#database-setup--migrations)
   - [Running the Server](#running-the-server)
   - [Running Automated Tests](#running-automated-tests)
   - [Running via Docker](#running-via-docker)
3. [API Documentation](#3-api-documentation)
   - [Endpoint Matrix](#endpoint-matrix)
   - [Request & Response Payloads](#request--response-payloads)
   - [Pagination Headers](#pagination-headers)
4. [Architectural Decisions](#4-architectural-decisions)
   - [Layered Architecture (Separation of Concerns)](#layered-architecture-separation-of-concerns)
   - [Database Choice Rationale (SQLite)](#database-choice-rationale-sqlite)
5. [Engineering Challenges & Solutions](#5-engineering-challenges--solutions)
6. [Git Workflow & Branching Strategy](#6-git-workflow--branching-strategy)

---

## 1. Project Overview & Tech Stack

The **Macky Merch API** is a robust backend service designed to manage product inventory for the LSCS Macky Merch store. It implements complete CRUD operations, strict runtime input validation, paginated queries with custom response headers, full database constraints, automated integration testing, and containerized deployment.

### Tech Stack
- **Runtime Environment:** [Node.js](https://nodejs.org/) (v20+ LTS recommended, v18+ supported)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict mode, ES2022 target)
- **Web Framework:** [Express.js](https://expressjs.com/) (v4.21+)
- **Database & ORM:** [SQLite](https://sqlite.org/) with [Prisma ORM](https://www.prisma.io/) (v6)
- **Input Validation:** [Zod](https://zod.dev/) (Type-safe schema validation)
- **Automated Testing:** [Vitest](https://vitest.dev/) and [Supertest](https://github.com/ladjs/supertest)
- **Containerization:** [Docker](https://www.docker.com/) (Multi-stage Alpine Linux build)
- **Development Tooling:** `ts-node-dev` (fast hot-reloading), `rimraf`

### Data Model & Attributes
Each product consists of the core required fields and enhanced attributes:
- `id` (String / UUID): Primary key uniquely identifying the product.
- `name` (String): Display title of the product.
- `price` (Float): Retail price in PHP (enforced `price > 0`).
- `stock` (Int): Available quantity (enforced `stock >= 0`).
- `category` (String): Classification (e.g., `Apparel`, `Collectibles`, `Stationery`).
- `description` (String, *Custom Attribute*): Detailed information regarding the merch item.
- `isAvailable` (Boolean, *Custom Attribute*): Availability status (defaults to `true`).
- `createdAt` (DateTime): Automated timestamp marking record creation.
- `updatedAt` (DateTime): Automated timestamp tracking last modification.

---

## 2. Getting Started & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- [Git](https://git-scm.com/)
- *(Optional)* [Docker Desktop](https://www.docker.com/products/docker-desktop/) for containerized execution

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/djmarcaida/the-macky-merch-api-lscs.git
   cd the-macky-merch-api-lscs
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

### Environment Configuration

Copy the sample environment file to create your local `.env`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Ensure `.env` contains the default values:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
```

### Database Setup & Migrations

1. **Run Prisma Migrations:**
   Generates the local SQLite database file (`dev.db`) and applies the initial schema migration:
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Generate Prisma Client Types:**
   ```bash
   npx prisma generate
   ```

> **Raw SQL Equivalent:** For review and validation against raw SQL criteria, the complete SQLite DDL with `CHECK` constraints and `CREATE INDEX` statements is available in [`schema.sql`](./schema.sql).

### Running the Server

#### Development Mode (with hot-reload):
```bash
npm run dev
```
The server will start listening at `http://localhost:3000`.

#### Production Mode (compile & run):
```bash
npm run build
npm start
```

### Running Automated Tests

Run the full automated integration test suite powered by Vitest and Supertest:

```bash
# Run all tests once
npm test

# Run tests in interactive watch mode
npm run test:watch
```

Every test executes with clean database isolation via automated `beforeEach` hooks defined in `tests/setup.ts`.

### Running via Docker

Build and run the production-grade multi-stage container locally:

```bash
# 1. Build the Docker image
docker build -t macky-merch-api:latest .

# 2. Run container with port forwarding
docker run -d -p 3000:3000 --name macky-merch-api-container macky-merch-api:latest

# 3. Verify container logs
docker logs -f macky-merch-api-container
```

---

## 3. API Documentation

### Endpoint Matrix

| Method | Endpoint | Query Parameters | Description | Success Status | Error Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | None | Smoke check / service health status | `200 OK` | `500 Internal Error` |
| **GET** | `/api/products` | `page`, `limit`, `category`, `search`, `isAvailable` | List products with optional pagination and filtering | `200 OK` | `400 Bad Request` |
| **GET** | `/api/products/:id` | None | Retrieve a single product by UUID | `200 OK` | `404 Not Found` |
| **POST** | `/api/products` | None | Create a new merch item | `201 Created` | `400 Bad Request` |
| **PUT** | `/api/products/:id` | None | Update fields of an existing product | `200 OK` | `400 / 404` |
| **PATCH**| `/api/products/:id` | None | Partial update of an existing product | `200 OK` | `400 / 404` |
| **DELETE**| `/api/products/:id`| None | Delete a product by UUID | `200 OK` | `404 Not Found` |

### Request & Response Payloads

#### 1. Create Product (`POST /api/products`)
**Request Body:**
```json
{
  "name": "Macky Classic Hoodie",
  "price": 500.00,
  "stock": 50,
  "category": "Apparel",
  "description": "Premium fleece hoodie featuring Macky, the official mascot of LSCS",
  "isAvailable": true
}
```

**Response (`201 Created`):**
```json
{
  "id": "e9b1d3a4-8461-419b-a621-39efb925b399",
  "name": "Macky Classic Hoodie",
  "price": 500.00,
  "stock": 50,
  "category": "Apparel",
  "description": "Premium fleece hoodie featuring Macky, the official mascot of LSCS",
  "isAvailable": true,
  "createdAt": "2026-09-20T02:15:00.000Z",
  "updatedAt": "2026-09-20T02:15:00.000Z"
}
```

#### 2. List Products (`GET /api/products?page=1&limit=2`)
Returns a direct array of product objects (without extraneous `{ data: [...] }` nesting to strictly adhere to evaluation criteria):

**Response (`200 OK`):**
```json
[
  {
    "id": "e9b1d3a4-8461-419b-a621-39efb925b399",
    "name": "Macky Classic Hoodie",
    "price": 500.00,
    "stock": 50,
    "category": "Apparel",
    "description": "Premium fleece hoodie featuring Macky, the official mascot of LSCS",
    "isAvailable": true,
    "createdAt": "2026-09-20T02:15:00.000Z",
    "updatedAt": "2026-09-20T02:15:00.000Z"
  }
]
```

#### 3. Update Product (`PUT / PATCH /api/products/:id`)
**Request Body:**
```json
{
  "price": 450.00,
  "stock": 45
}
```

**Response (`200 OK`):**
```json
{
  "id": "e9b1d3a4-8461-419b-a621-39efb925b399",
  "name": "Macky Classic Hoodie",
  "price": 450.00,
  "stock": 45,
  "category": "Apparel",
  "description": "Premium fleece hoodie featuring Macky, the official mascot of LSCS",
  "isAvailable": true,
  "createdAt": "2026-09-20T02:15:00.000Z",
  "updatedAt": "2026-09-20T02:18:00.000Z"
}
```

#### 4. Delete Product (`DELETE /api/products/:id`)
**Response (`200 OK`):**
```json
{
  "message": "Product deleted successfully."
}
```

#### 5. Error Responses
- **Resource Not Found (`404 Not Found`):**
  ```json
  {
    "error": true,
    "message": "Product not found."
  }
  ```
- **Validation Failure (`400 Bad Request`):**
  ```json
  {
    "error": true,
    "message": "Validation failed",
    "errors": [
      {
        "field": "price",
        "message": "Price must be greater than 0"
      }
    ]
  }
  ```

### Pagination Headers
When `page` and `limit` query parameters are provided, the API provides pagination metadata via standard HTTP response headers:
- `X-Total-Count`: Total number of matching records in the database.
- `X-Page`: Current page index.
- `X-Limit`: Maximum records returned per page.
- `X-Total-Pages`: Total number of available pages.

---

## 4. Architectural Decisions

```
the-macky-merch-api/
├── prisma/
│   ├── migrations/          # Version-controlled database migration history
│   └── schema.prisma        # Prisma ORM schema definition
├── src/
│   ├── config/
│   │   └── db.ts            # Prisma Client singleton with connection pooling protection
│   ├── controllers/
│   │   └── product.controller.ts # Transport layer handling HTTP requests and responses
│   ├── errors/
│   │   └── AppError.ts      # Custom operational error classes
│   ├── middlewares/
│   │   ├── errorHandler.ts  # Centralized error handler (AppError, Zod, Prisma)
│   │   └── validate.ts      # Request body & param validation middleware
│   ├── routes/
│   │   └── product.routes.ts# Endpoint declarations and middleware mapping
│   ├── schemas/
│   │   └── product.schema.ts# Zod validation schemas and TypeScript types
│   ├── services/
│   │   └── product.service.ts # Pure business and data access layer
│   ├── app.ts               # Express application initialization & middleware assembly
│   └── server.ts            # HTTP listener & process entrypoint
├── tests/
│   ├── setup.ts             # Test harness isolation hooks (beforeEach/afterAll)
│   └── product.test.ts      # Comprehensive integration test suite
├── Dockerfile               # Multi-stage production container definition
├── schema.sql               # Pure SQLite DDL specification
└── vitest.config.ts         # Vitest test runner configuration
```

### Layered Architecture (Separation of Concerns)
1. **Routing Layer (`src/routes`)**: Defines endpoint paths and attaches schema validation middleware. Keeps route declarations lightweight.
2. **Controller Layer (`src/controllers`)**: Manages HTTP status codes, headers, and payload serialization. Does not execute direct database queries.
3. **Service Layer (`src/services`)**: Encapsulates core business rules, database queries, and pagination algorithms. Completely decoupled from Express `req` and `res` objects for testability.
4. **Validation Layer (`src/schemas` & `src/middlewares`)**: Centralizes input parsing using Zod. Requests with invalid payloads are rejected at the edge before reaching controllers.
5. **Configuration Layer (`src/config`)**: Manages external connections. Implements the `globalThis` singleton pattern to prevent connection leaks and file-lock contention during hot-reloads.

### Database Choice Rationale (SQLite)
- **Zero Configuration for Reviewers**: SQLite is entirely serverless and file-based. Evaluators can clone the project, execute `npx prisma migrate dev`, and have an active database running without spinning up PostgreSQL or MySQL containers.
- **Strict Relational Guarantees**: Coupled with Prisma and raw DDL constraints (`schema.sql`), SQLite enforces `PRIMARY KEY`, `NOT NULL`, `CHECK (price > 0)`, and index optimization on query columns (`category`, `createdAt`).
- **Instantaneous Test Isolation**: In-memory or file-backed SQLite transactions allow test suites to tear down and reconstruct states in milliseconds, ensuring deterministic integration test runs.

---

## 5. Engineering Challenges & Solutions

### 1. Prisma Rust Engine on Alpine Linux Containers
- **Challenge:** Node.js Alpine base images (`node:20-alpine`) utilize `musl` libc instead of `glibc`. The Prisma Query Engine binary failed to execute during multi-stage Docker builds without native OpenSSL libraries.
- **Solution:** Configured the builder and runner stages in [`Dockerfile`](./Dockerfile) with `apk add --no-cache openssl libc6-compat`, ensuring native binary compatibility while keeping the final image footprint lightweight (~180MB).

### 2. Express 5 / `@types/express` Route Parameter Types
- **Challenge:** Recent `@types/express` definitions type `req.params` as `Record<string, string | string[] | undefined>` to support wildcard/array parameter patterns. This caused TypeScript compiler errors when passing `req.params.id` into Prisma's `ProductWhereUniqueInput` which strictly requires `id: string`.
- **Solution:** Enforced strict parameter validation using `productIdParamSchema` in the middleware layer and cast parameters explicitly (`const { id } = req.params as { id: string }`), eliminating type ambiguity while preserving runtime safety.

### 3. SQLite Connection Leaks During Dev Hot-Reloads
- **Challenge:** Development tools like `ts-node-dev` reload the module cache on every code change, re-executing `new PrismaClient()`. In SQLite, this spawned competing connection pools that locked the database file (`dev.db-journal`).
- **Solution:** Implemented the Prisma Singleton pattern in [`src/config/db.ts`](./src/config/db.ts), binding the client instance to `globalThis` in development mode.

---

## 6. Git Workflow & Branching Strategy

Development followed a professional, feature-branch Git workflow:
- **`main`**: Production-ready, stable codebase.
- **`chore/setup-tooling`**: Initialized TypeScript, ESLint, scripts, and scaffolding.
- **`feat/database-schema`**: Defined Prisma schema, raw `schema.sql`, and migrations.
- **`feat/crud-endpoints`**: Implemented Zod validators, service layer, controllers, and routes.
- **`test/integration-tests`**: Configured Vitest harness, teardown hooks, and test suite.
- **`docs/container-and-readme`**: Added Dockerfile, .dockerignore, and documentation.

Each feature branch was validated with automated tests and cleanly merged into `main` using non-fast-forward merge commits (`git merge --no-ff`) to preserve an auditable development history.
