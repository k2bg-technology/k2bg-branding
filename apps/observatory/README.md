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

Dashboard routes read strict JSON definitions from `OBSERVATORY_DASHBOARDS_DIR`. The [sample dashboard](modules/dashboard/fixtures/sample-dashboard.json) documents `stat-tiles`, `time-series`, `table`, `bars`, and `calendar-heatmap` sections, including a finer daily series on a monthly dashboard, a `latest` day and its hourly shape, availability, readiness, source filters, a fixed-list filter control, value transforms, formats, reduction bindings, `defaultPeriod`, labels, and a previous-period comparison. Files with definition issues are skipped and logged without hiding valid dashboards.

A dashboard requires `grain: "month"`, `"week"`, or `"day"`. Open `/dashboards/<id>?period=YYYY-MM`, `?period=YYYY-Www` (ISO week), or `?period=YYYY-MM-DD` according to that grain. Without `period`, the dashboard opens on `latest-with-data` by default; `last-complete` selects the previous complete period in the dashboard time zone and clamps it to the available range. The optional `periodSource` supplies navigation bounds; otherwise the first section's source does. Bounds follow that source's filters. Each section reads its own filtered source, including periods outside the navigation bounds. A tile with `comparison.direction` (`higher-is-better`, `lower-is-better`, or `neutral`) displays a change from its own source's previous period. `labels.period`, `labels.previousPeriod`, and `labels.nextPeriod` override navigation text.

Each section source and `periodSource` can declare one or more `filters`, joined with AND. Each filter names a column and an `operator`: `equals`, `not-equals`, `less-than`, `less-than-or-equal`, `greater-than`, or `greater-than-or-equal` takes one `value`; `in` or `not-in` takes a nonempty `values` array whose entries all have the same type; `is-null` and `is-not-null` take no value. Values are strings, finite numbers, or booleans and are bound as query parameters. SQL NULL matches no comparison or set filter, including `not-equals` and `not-in`; use `is-null` to include it.

A dashboard may declare `controls`: each control has an `id` (same pattern as a section id, unique within the dashboard), a `label`, a `column`, a non-empty `options` list of distinct, non-blank strings, and an optional `allLabel` (default "All"). A section opts in with `controls: ["<id>"]`; every declared control must be listed by at least one section, and a section lists an id once. The reader's choice is appended to each listing section's `filters` as `column = value`, bound as a query parameter, before transforms and reductions, so totals follow the filtered rows; sections that do not list the control are unchanged, and period navigation bounds (`periodSource`) ignore controls. The column must be a STRING column of every listing section's view: a missing or differently typed column makes that section unavailable inline and logs the error. The controls render as labelled selects with an apply button; `labels.applyControls` (default "Apply") names the button. `bars` sections do not take `controls`.

URL state: `period`, `control.<id>`, and `page.<sectionId>` are the dashboard's keys; any other key is carried through every transition untouched. A `control.<id>` value must be one of the control's options; an empty value (`control.<id>=`, what the form submits for the all option) selects all and is dropped from later links. The route returns 404 for a `period` outside the dashboard grain's form, an undeclared `control.<id>`, a value outside the list, a `page.<sectionId>` on an unknown or unpaged section or with a non-positive page, and a repeated key. Period navigation keeps controls and drops every `page.*`; applying controls keeps `period` (when present) and drops every `page.*`; paging keeps period and controls.

A `time-series` section may set its own `grain`:

| Dashboard grain | Allowed section grains |
| --- | --- |
| `month` | `month`, `day` |
| `week` | `week`, `day` |
| `day` | `day`, `hour` |

Without a section `grain`, the dashboard grain applies. A positive integer `window` counts trailing buckets of the section grain, ending at the selected period's last bucket. It is required at the dashboard grain. A finer section without `window` covers the selected period. A section also declares a shared `format` and optional `unit`, and 1–12 `series` bindings with `label`, `column`, and optional `reduction` (default `sum`). Its `variant` is `line` by default or `area`; `stacked` defaults to `false`. Stacking adds values, so it requires the `area` variant and `sum` for every series.

Any section source or `periodSource` accepts a time binding as a column name, `{ "column": "recorded_at", "type": "timestamp" }`, or `{ "date": "reading_date", "hour": "reading_hour" }`. The pair names a DATE column and an INT64 hour column containing wall-clock hours 0–23 in the dashboard time zone. Hour sections require the pair; other sections and period bounds may also use it. Invalid source hours make the affected section unavailable inline.

A section may set `period: "latest"` to read its source's own latest date instead of the selected period. Period navigation does not affect it, and `labels.asOf` (default "As of") followed by that date precedes its content. A `latest` time-series requires `grain: "hour"` with the date-and-hour binding on any dashboard grain and draws the 24 hours of that date; because a latest section reads one date, `window` and tile `comparison` are rejected at load.

`availability { since, minimumBuckets?, note? }` states when a source started accumulating; `since` is a calendar date. With `minimumBuckets`, the section shows an accumulating state instead of its data — `labels.accumulatingSince` (default "Accumulating since") with the date, `labels.availableFrom` (default "Available from") with the first bucket that lies `minimumBuckets` buckets after the bucket containing `since`, and the note — until the last bucket the section reads is that bucket or later. A section that follows the selected period decides this by calendar arithmetic without a query; a `latest` section decides it from its latest date. Buckets are counted in the section's own grain: a time-series in its `grain`, other sections in the dashboard grain, and a `latest` section in days (hours for a latest time-series). Without `minimumBuckets`, the same line appears above the content.

`readiness { column, note? }` names a BOOL column of the section source. While any row of the latest time slot inside the read period (after source filters) is `false` or NULL, the section shows `labels.notReady` (default "The latest data is not ready yet") and the note instead of its data; the data query is not issued. A readiness column of another type renders the unavailable state. `bars` and `calendar-heatmap` sections do not take `period`, `availability`, or `readiness`.

Missing buckets throughout the requested range receive null values and appear as gaps. Chart points use local midnight for date buckets and local hours for hour buckets in the dashboard time zone. If local midnight does not exist, a date bucket uses that date's first existing hour. A nonexistent spring hour is omitted; a repeated fall hour uses its earlier occurrence. A query reads at most 121 complete returned buckets to detect the 120-bucket cap. Synthetic null points do not count toward that cap. If more returned buckets exist, the oldest are omitted and `labels.truncated` (default: “Older periods are not shown”) accompanies the shortened displayed range.

A `bars` section draws one bar per `x` entry. `x: { "axis": "time", "window": N }` draws trailing buckets of the dashboard grain ending at the selected period, spine-filled with gaps for missing buckets, under the same 120-bucket cap and `labels.truncated` as time series. `x: { "axis": "category", "column", "order", "by"?, "topN"? }` draws the distinct values of a column aggregated over the selected period only. Series come from `series` (1–12 bindings with `label`, `column`, optional `reduction` default `sum`, `transform`) or from `pivot { column, value { column, reduction?, transform? }, topN }` (time axis only; one series per category value, largest first). `topN { count, otherLabel }` keeps the `count` largest categories by the ranking value: the sum of one binding over the displayed window, `pivot.value` or the series named by `x.by` (required when several series rank). It folds every other category, including NULL, into a last entry labelled `otherLabel`; ties resolve by category value. `pivot.topN.count` is 1–11, `x.topN.count` is 1–100; a category axis without `topN` shows every category. `order` is `"value-desc"` or `{ "sortKey": { "column", "type": "text" | "number" } }` (ascending; a `text` key compares by code point; a category whose rows carry different sort keys makes the section unavailable). Top-N selects, `order` arranges, and the remainder stays last. A remainder, `stacked`, and `value-desc` add values up and require `sum` on the bindings they add. Category values are shown as their text (`CAST AS STRING`); a NULL category is labelled `labels.nullCategory` (default “None”); a category whose text equals `otherLabel` or that label makes the section unavailable. `format` and `unit` apply to every series.

Tiles and series accept `number`, `currency`, `percent` (`inputScale`: `ratio` or `percent`), and `duration` formats. Duration requires `inputUnit` (`seconds`, `minutes`, or `hours`) and displays whole minutes with hours where applicable. The optional `unit` text follows the formatted value.

Each tile and series may declare `transform: "negate"` or `transform: "absolute"`. The transform acts on each row's value after source filtering and before its declared reduction; a `latest` binding reads and checks distinct transformed values. The processing order is filter → transform → reduce → fill missing periods → display.

A `table` section reads the view's rows within the selected period without aggregation. Its `columns` declare `header`, `column`, and `type`: `text`, `number`, `date` for DATE columns, or `timestamp`. Optional `alignment` is `start` or `end`; numbers default to `end`, while other columns default to `start`. Number columns accept `format` (default `number`), `unit`, and `transform`. Optional `sort { column, direction }` uses `ascending` or `descending` on the displayed, transformed value, with NULL last and remaining columns as tie-breakers; the default order puts the newest source time first. A table declares exactly one of `limit` (1–100, top-N without a truncation warning) or `paging { pageSize }` (1–100). `page.<sectionId>` is accepted only for a paged table; a page past the end shows the last page. `emptyMessage` replaces the generic empty state. Dates use medium date formatting; timestamps also show time in the dashboard time zone. `labels.previousPage`, `labels.nextPage`, and `labels.pagination` override pagination text. A column type that does not match its view column renders the unavailable state.

A `calendar-heatmap` section shows one value per calendar day. Its `value` binds a `column` with an optional `reduction` (default `sum`) and `transform`, reduced per day in the dashboard time zone; `format` and the optional `unit` format each day's value. `range` is `trailing` (default), which covers the `window` days (1–366, required) ending on the selected period's last day, or `calendar-year`, which covers 1 January to 31 December of the year containing that last day and does not take `window`. Days without rows render as outlined cells, distinct from zero, and are named by `labels.missingValue` (default “No data”); the optional `maximum` fixes the top of the color scale, and `scaleLabels { less, more }` adds a legend. Weekday and month names and the first day of the week follow the dashboard `locale`. Calendar days are `YYYY-MM-DD` strings and are never shifted by the time zone: a timestamp binding is converted to the dashboard time zone's date before grouping, while DATE and date-and-hour bindings are read as-is.

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
