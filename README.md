# Badalin Ecosystem API

A robust, AI-enhanced backend system for the Badalin Ecosystem, built with NestJS, Prisma, and PostgreSQL. This project leverages advanced document intelligence and high-availability infrastructure to streamline pilgrim management and visa processing.

## 🚀 Key Features

### 🤖 AI-Powered Intelligence
- **Intelligent OCR**: Automated high-accuracy data extraction from Passports and IDs (KTP) using **Google Cloud Vision API**.
- **Nusuk Compatibility Engine**: Advanced validation logic featuring:
  - **Confidence Scoring**: Weighted analysis of OCR results to guarantee document clarity.
  - **MRZ Checksum Verification**: ICAO-standard validation of Machine Readable Zones to ensure **100% acceptance** by the Saudi Arabian **Nusuk system**.
  - **Quality Guard**: Automated detection of glare, blur, and lighting issues before submission.

### 🏗️ Advanced Infrastructure
- **Dynamic Provider Rotation**: High-availability OCR infrastructure with an automated **"Waterfall" rotation system**. 
  - Maximizes usage of multiple Google Cloud project quotas (Free Tier optimization).
  - Automated account switching based on monthly usage limits managed via database.
- **Hexagonal Architecture**: Strict separation of concerns between Domain, Ports, Adapters, and UseCases for maximum maintainability.
- **Automated Verification**: Integrated verification layers at the UseCase level to ensure data integrity.

### 💼 core Business Logic
- **Visa Submission Workflow**: Full lifecycle management of visa applications.
- **Pilgrim Management**: Secure and efficient handling of pilgrim records.
- **Agency Multi-Tenancy**: Support for multiple agencies with unique slugs and specific business rules.
- **RBAC Security**: Granular Role-Based Access Control integrated with JWT authentication.

## 🏗 Architecture Documentation

This project adheres to **Hexagonal Architecture** (Ports and Adapters):

### Folder Structure

- `src/packages`: Core business modules (Auth, Pilgrim, Submission, etc.).
  - `domain`: Pure business entities.
  - `ports`: Interfaces defining contracts for UseCases and Repositories.
  - `usecase`: Pure business logic implementations (includes **Automated Verification**).
  - `repository`: Implementation of persistence adapters.
  - `controller`: Entry points for RESTful API interaction.
- `src/shared`: Global utilities, database config, and shared services (OCR, Providers).

### Naming & Standards

- **Application**: `camelCase` for consistency.
- **Database**: `snake_case` with explicit Prisma mappings (`@map`, `@@map`).
- **External APIs**: Dynamically managed via `OcrProvider` registry.

## 🔐 Security & Configuration

> [!IMPORTANT]
> **Credential Privacy**: Google Cloud Platform (GCP) credential files (`*.json`) are intentionally ignored by Git for security reasons. They must never be committed to the repository.

### Manual GCP Credential Setup
1. Obtain your Service Account JSON keys from the [Google Cloud Console](https://console.cloud.google.com/).
2. Place the JSON files directly in the root directory of the project.
3. Ensure the filenames match exactly with the entries you plan to use in the `ocr_providers` database table (e.g., `gcp-key.json`).

### ☁️ Google Vision API Billing
Before using the OCR system, ensure that:
- The [Cloud Vision API](https://console.cloud.google.com/apis/library/vision.googleapis.com) is enabled for your project.
- **Billing is active** for your GCP account. While there is a free tier (1,000 units/month), an active billing account is required to activate the API.

## ⚙️ Environment Variables

Create a `.env` file in the root directory using the following template:

```env
PORT=3004
MODE=API # API, SCHEDULER, or WORKER
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"

# Security
JWT_SECRET="your-super-secret-key"
INTERNAL_API_KEY="your-internal-api-key"

# AI & OCR Infrastructure
# Primary key for local development (must exist in root)
GOOGLE_APPLICATION_CREDENTIALS="gcp-key.json"
```

## 🛠 Getting Started

### 1. Installation

```bash
$ npm install
```

### 2. Database & AI Initialization

> [!WARNING]
> **Check Seeder Data**: Before running the seeder, open `src/shared/database/seed/ocr-provider.ts` and verify that the `projectId` and `keyFilename` match your actual GCP service account details.

Sync schema and generate Prisma client:

```bash
$ npx prisma generate --schema=src/shared/database/prisma/schema.prisma
$ npx prisma db push --schema=src/shared/database/prisma/schema.prisma
```

Run the seeder to initialize the **Waterfall OCR rotation** system:

```bash
$ npm run prisma:seed
```

### 3. Running the Project

```bash
# Development
$ npm run dev

# Production
$ npm run build
$ npm run start:prod
```

## 🧪 Testing

```bash
# Run unit tests
$ npm run test

# Run e2e tests
$ npm run test:e2e
```

## 📜 License

This project is [UNLICENSED](LICENSE).
