# K2BG Observatory

![An observatory on a hilltop at night, watching over a city skyline that dissolves into glowing charts and constellation graphs](public/images/hero.jpg)

A **Next.js** application that renders dashboards from JSON definitions of warehouse views, columns, and sections. The dashboard index at `/` lists loaded definitions, and `/catalog` lists the tables and views in their referenced datasets. It runs locally only and is part of the [K2BG Branding monorepo](../../README.md).

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

Open [http://localhost:3003](http://localhost:3003). Dashboard sections and the table catalog read from the warehouse, so configure the [environment variables](#environment-variables) and authenticate first:

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
│   ├── layout.tsx             # Root layout and dashboard navigation
│   ├── page.tsx               # Dashboard index
│   ├── dashboards/[id]/       # Definition-driven dashboard route
│   └── catalog/               # Referenced-dataset table catalog route
├── components/
│   ├── dashboard/             # Dashboard sections and states
│   ├── site-header/           # Site navigation
│   └── table-catalog/         # Table catalog and its unavailable state
├── infrastructure/
│   ├── di/                    # Use-case factories (constructor injection)
│   └── warehouse/             # Warehouse client (BigQuery) + data-cache wrapper
├── modules/
│   ├── dashboard/             # Definition model, loader, and section queries
│   └── catalog/               # Referenced-dataset table and view metadata
├── public/
│   └── images/                # Static assets (hero image)
├── .env.example               # Environment variable template
├── next.config.mjs            # Next.js and security-header configuration
└── vitest.config.mts          # Test configuration
```

Every warehouse read goes through `WarehouseClient.query()`, which caches rows in the Next.js data cache for the query's `revalidate` window. The table catalog joins region-scoped `INFORMATION_SCHEMA.TABLES` and `INFORMATION_SCHEMA.TABLE_STORAGE` metadata and caches the result for one day. Adapters wrap driver failures in `RepositoryError`; data failures render inline unavailable states.

## Dashboard Definitions

Dashboard routes read strict JSON definitions from `OBSERVATORY_DASHBOARDS_DIR`. The [sample dashboard](modules/dashboard/fixtures/sample-dashboard.json) documents the PR1 `stat-tiles` shape, including currency, percent, and reduction bindings. Files with definition issues are skipped and logged without hiding valid dashboards.

## Environment Variables

Create `apps/observatory/.env.local` (see `.env.example`):

```bash
LOG_LEVEL=info
WAREHOUSE_PROJECT_ID=
WAREHOUSE_LOCATION=
OBSERVATORY_DASHBOARDS_DIR=
GOOGLE_APPLICATION_CREDENTIALS=
```

- `WAREHOUSE_PROJECT_ID` — Google Cloud project that owns the warehouse (required).
- `WAREHOUSE_LOCATION` — region of the warehouse datasets, e.g. `asia-northeast1` (required; qualifies the region-scoped metadata views).
- `OBSERVATORY_DASHBOARDS_DIR` — directory containing dashboard definition JSON files (optional; defaults to `dashboards/` under the Observatory app directory).
- `GOOGLE_APPLICATION_CREDENTIALS` — path to a service-account key for Application Default Credentials (optional; leave unset after `gcloud auth application-default login`).

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
