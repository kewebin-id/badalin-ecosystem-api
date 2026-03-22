# Badalin Ecosystem API

A robust and scalable backend system for the Badalin Ecosystem, built with NestJS, Prisma, and PostgreSQL. The project follows Hexagonal Architecture principles to ensure maintainability and testability.

## 🚀 Key Features

- **Visa Submission Management**: Complete workflow for handling visa applications.
- **Pilgrim Management**: Secure storage and retrieval of pilgrim data.
- **Auth System**: JWT-based authentication with role-based access control.
- **Agency Integration**: Multi-tenant support with agency-specific logic and unique slugs.
- **Hexagonal Architecture**: Clear separation of concerns between Ports, Adapters, and UseCases.

## 🛠 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) database

## 🏗 Architecture Documentation

This project adheres to **Hexagonal Architecture** (also known as Ports and Adapters):

### Folder Structure

- `src/packages`: Contains business domains (Auth, Pilgrim, Submission, etc.).
  - `domain`: Entity definitions.
  - `ports`: Interfaces for UseCases and Repositories.
  - `usecase`: Business logic implementations.
  - `repository`: Data access implementations (Adapters).
  - `controller`: Web interface implementations.
- `src/shared`: Reusable modules such as database utilities, common guards, middleware, and interceptors.

### Naming Conventions

- **Application Layer**: Uses `camelCase` for all fields and variables.
- **Database Layer**: Uses `snake_case` for all table and column names (mapped via Prisma `@map` and `@@map`).

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the following:

```env
PORT=3004
MODE=API # API, SCHEDULER, or WORKER
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"

# Security
JWT_SECRET="your-super-secret-key"
INTERNAL_API_KEY="your-internal-api-key"

# Defaults
DEFAULT_AGENCY=badalin
```

## 🛠 Getting Started

### 1. Installation

```bash
$ npm install
```

### 2. Database Setup

Generate the Prisma Client and run migrations:

```bash
$ npx prisma generate --schema=src/shared/database/prisma/schema.prisma
$ npx prisma migrate dev --schema=src/shared/database/prisma/schema.prisma
```

(Optional) Seed initial data:

```bash
$ npm run prisma:seed
```

### 3. Running the Project

```bash
# Development mode
$ npm run dev

# Production mode
$ npm run build
$ npm run start:prod
```

## 🧪 Testing

```bash
# Run unit tests
$ npm run test

# Run e2e tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## 📜 License

This project is [UNLICENSED](LICENSE).
