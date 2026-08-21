# K2BG Observatory

![An observatory on a hilltop at night, watching over a city skyline that dissolves into glowing charts and constellation graphs](public/images/hero.jpg)

A **Next.js** application that visualizes accumulated personal data — finances, health, home environment, and web analytics — in one place. It runs locally only and is the web surface of the Observatory concept. Part of the [K2BG Branding monorepo](../../README.md).

## Technology Stack

| Category | Technologies |
| --- | --- |
| **Framework** | Next.js, React, TypeScript |
| **Styling** | Tailwind CSS, shared `ui` package |
| **Data** | Data warehouse (BigQuery) read through Clean Architecture ports, cached by the Next.js data cache |
| **Logging** | Shared `logger` package (pino) |
| **Testing** | Vitest, Testing Library |
| **Linting** | Biome |

## Getting Started

### Prerequisites

- Node.js 22+ (required by the warehouse SDK; the repo toolchain pins 24 in `.nvmrc`)
- pnpm 10+

### Installation

From the monorepo root:

```bash
pnpm install
```

### Development

```bash
# From the monorepo root
pnpm -F observatory dev

# Or from this directory
pnpm dev
```

Open [http://localhost:3003](http://localhost:3003). The dashboard reads from the warehouse, so configure the [environment variables](#environment-variables) and authenticate first:

```bash
gcloud auth application-default login
```

### Build and Test

```bash
pnpm -F observatory build      # Production build
pnpm -F observatory test       # Run once
pnpm -F observatory test:watch # Watch mode
pnpm -F observatory lint       # Run Biome checks
pnpm -F observatory typecheck  # Run TypeScript checks
```

## Project Structure

```text
apps/observatory/
├── app/
│   ├── globals.css            # Design-token and shared UI style imports
│   ├── layout.tsx             # Root layout and metadata
│   └── page.tsx               # Dashboard entry page (rendered per request)
├── components/
│   └── table-catalog/         # Table catalog section and its unavailable state
├── infrastructure/
│   ├── di/                    # Use-case factories (constructor injection)
│   └── warehouse/             # Warehouse client (BigQuery) + data-cache wrapper
├── modules/
│   └── catalog/               # Domain module: every table across the project's datasets
│       ├── use-cases/         # Use cases, query-service ports, read models
│       └── adapters/          # Warehouse query services, mappers, errors, logger
├── public/
│   └── images/                # Static assets (hero image)
├── .env.example               # Environment variable template
├── next.config.mjs            # Next.js and security-header configuration
└── vitest.config.mts          # Test configuration
```

Every warehouse read goes through `WarehouseClient.query()`, which caches the rows in the Next.js data cache for the `revalidate` window declared by the query (the table catalog — read from the region-scoped `INFORMATION_SCHEMA.TABLE_STORAGE` view — uses one day). Adapters wrap driver failures in `RepositoryError`; the page renders an inline "Warehouse data unavailable" state instead of crashing.

## Environment Variables

Create `apps/observatory/.env.local` (see `.env.example`):

```bash
LOG_LEVEL=info
WAREHOUSE_PROJECT_ID=
WAREHOUSE_LOCATION=
GOOGLE_APPLICATION_CREDENTIALS=
```

- `WAREHOUSE_PROJECT_ID` — Google Cloud project that owns the warehouse (required).
- `WAREHOUSE_LOCATION` — region of the warehouse datasets, e.g. `asia-northeast1` (required; qualifies the region-scoped metadata views).
- `GOOGLE_APPLICATION_CREDENTIALS` — path to a service-account key for Application Default Credentials (optional; leave unset after `gcloud auth application-default login`).

Datasets are organised per data source. Each domain module declares its own `WAREHOUSE_<DOMAIN>_DATASET_ID` variable (for example `WAREHOUSE_FINANCE_DATASET_ID`); the variable name is the role, the value is the dataset id, so data-source product names stay out of the code.

The warehouse SDK runs only in Node.js: all query code lives in server components and `server-only` modules.

### Warehouse Access Requirements

The authenticated principal (your user for Application Default Credentials, or a service account) needs these project-level IAM roles on `WAREHOUSE_PROJECT_ID`:

- `roles/bigquery.jobUser` — run queries.
- `roles/bigquery.metadataViewer` — read the region-scoped `INFORMATION_SCHEMA` views (dataset-level grants are not enough).

The table catalog reads `INFORMATION_SCHEMA.TABLE_STORAGE`, which is disabled by default. Enable it once per project and region (requires `roles/bigquery.admin`); the view stays empty until BigQuery backfills it, which takes up to one day:

```bash
bq query --location=<WAREHOUSE_LOCATION> --use_legacy_sql=false \
  'ALTER PROJECT `<WAREHOUSE_PROJECT_ID>` SET OPTIONS (`region-<WAREHOUSE_LOCATION>.enable_info_schema_storage` = TRUE)'
```
