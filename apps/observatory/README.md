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

Dashboard routes read strict JSON definitions from `OBSERVATORY_DASHBOARDS_DIR`. Files with definition issues are skipped and logged without hiding valid dashboards.

The [sample dashboard](modules/dashboard/fixtures/sample-dashboard.json) is a working reference. It documents `stat-tiles`, `time-series`, `table`, `bars`, `calendar-heatmap`, `matrix-heatmap`, `pivot-table`, `donut`, `treemap`, and `scatter` sections, including:

- a finer daily series on a monthly dashboard, and a `latest` day with its hourly shape;
- long-form series split by a category column, and band series;
- thresholds and reference bands;
- moving averages, running totals and averages, rebasing, and tile sparklines;
- availability, readiness, and source filters;
- fixed-list and distinct-value filter controls;
- value transforms, formats, and reduction bindings;
- `defaultPeriod`, labels, and a previous-period comparison.

### Periods and Navigation

A dashboard requires `grain`. Open a period with `/dashboards/<id>?period=…` in the form of that grain:

| `grain` | `period` form |
| --- | --- |
| `month` | `YYYY-MM` |
| `week` | `YYYY-Www` (ISO week) |
| `day` | `YYYY-MM-DD` |

- **Default period.** Without `period`, `defaultPeriod` decides where the dashboard opens: `latest-with-data` (default), or `last-complete`, which selects the previous complete period in the dashboard time zone and clamps it to the available range.
- **Navigation bounds.** The optional `periodSource` supplies navigation bounds; otherwise the first section's source does. Bounds follow that source's filters.
- **Section reads.** Each section reads its own filtered source, including periods outside the navigation bounds.
- **Labels.** `labels.period`, `labels.previousPeriod`, and `labels.nextPeriod` override navigation text.

### Sources

#### Time Binding

Any section source or `periodSource` accepts a time binding in one of three forms:

| Form | Example |
| --- | --- |
| Column name | `"recorded_at"` |
| Timestamp column | `{ "column": "recorded_at", "type": "timestamp" }` |
| Date-and-hour pair | `{ "date": "reading_date", "hour": "reading_hour" }` |

- The pair names a DATE column and an INT64 hour column containing wall-clock hours 0–23 in the dashboard time zone.
- Hour sections require the pair; other sections and period bounds may also use it.
- Invalid source hours make the affected section unavailable inline.

#### Filters

Each section source and `periodSource` can declare one or more `filters`, joined with AND. Each filter names a `column` and an `operator`:

| Operator | Operand |
| --- | --- |
| `equals`, `not-equals`, `less-than`, `less-than-or-equal`, `greater-than`, `greater-than-or-equal` | one `value` |
| `in`, `not-in` | a nonempty `values` array whose entries all have the same type |
| `is-null`, `is-not-null` | none |

- Values are strings, finite numbers, or booleans and are bound as query parameters.
- SQL NULL matches no comparison or set filter, including `not-equals` and `not-in`; use `is-null` to include it.

### Controls

A dashboard may declare `controls`: selects that let the reader filter the sections that list them.

| Field | Meaning |
| --- | --- |
| `id` | Same pattern as a section id, unique within the dashboard |
| `label` | Select label |
| `column` | Column the choice filters |
| `options` | A fixed list or `"distinct"` (below) |
| `allLabel` | Optional; default "All" |

**Options.**

- A fixed list is a non-empty list of distinct, non-blank strings, used as written. It does not take `source`, `order`, or `value`.
- `"distinct"` reads the column's distinct values in the control's `source` (default: the period source, `periodSource` or the first section's source) between the dashboard's period bounds. `NULL` and empty strings are dropped, and the list is cut at 100 (a cut is logged at warn). `order` arranges the values:
  - `"value-desc"` ranks by `value` (`{ column, reduction: "sum", transform? }`, required).
  - `{ "sortKey": { "column", "type": "text" | "number" } }` reads a sort column and does not take `value`.

**Sections.**

- A section opts in with `controls: ["<id>"]` and lists an id once. Every declared control must be listed by at least one section.
- The reader's choice is appended to each listing section's `filters` as `column = value`, bound as a query parameter, before transforms and reductions, so totals follow the filtered rows.
- Sections that do not list the control are unchanged, and period navigation bounds (`periodSource`) ignore controls.
- The column must be a STRING column of every listing section's view. A missing or differently typed column makes that section unavailable inline and logs the error.

**Rendering.**

- The controls render as labelled selects with an apply button; `labels.applyControls` (default "Apply") names the button.
- When a distinct control's options cannot be read (a wrong column or source, a warehouse failure), the error is logged and the control shows `labels.controlOptionsUnavailable` (default "Options could not be loaded") under a select that keeps only the all option and the current choice. The other controls and sections are unaffected.

### URL State

`period`, `control.<id>`, and `page.<sectionId>` are the dashboard's keys; any other key is carried through every transition untouched.

- A `control.<id>` value must be one of the control's options. For a distinct control, it must be one of the resolved values; while its options cannot be read, any non-empty value is accepted and bound as the filter parameter.
- An empty value (`control.<id>=`, what the form submits for the all option) selects all and is dropped from later links.

The route returns 404 for:

- a `period` outside the dashboard grain's form;
- an undeclared `control.<id>`, or a value outside the list;
- a `page.<sectionId>` on an unknown or unpaged section, or with a non-positive page;
- a repeated key.

Each transition keeps or drops the other keys:

| Transition | `period` | `control.*` | `page.*` |
| --- | --- | --- | --- |
| Period navigation | changes | kept | dropped |
| Applying controls | kept (when present) | changes | dropped |
| Paging | kept | kept | changes |

### Data Availability

#### Latest Period

A section may set `period: "latest"` to read its source's own latest date instead of the selected period.

- Period navigation does not affect it, and `labels.asOf` (default "As of") followed by that date precedes its content.
- A `latest` time-series requires `grain: "hour"` with the date-and-hour binding on any dashboard grain, and draws the 24 hours of that date.
- Because a latest section reads one date, `window` and tile `comparison` are rejected at load.

#### Availability

`availability { since, minimumBuckets?, note? }` states when a source started accumulating; `since` is a calendar date.

- **With `minimumBuckets`,** the section shows an accumulating state instead of its data until the last bucket the section reads is the "available from" bucket or later. The state shows:
  - `labels.accumulatingSince` (default "Accumulating since") with the date;
  - `labels.availableFrom` (default "Available from") with the first bucket that lies `minimumBuckets` buckets after the bucket containing `since`;
  - the note.
- **Without `minimumBuckets`,** the same line appears above the content.
- A section that follows the selected period decides this by calendar arithmetic without a query; a `latest` section decides it from its latest date.
- Buckets are counted in the section's own grain: a time-series or a time-axis `bars` section in its `grain`, other sections in the dashboard grain, and a `latest` section in days (hours for a latest time-series).

#### Readiness

`readiness { column, note? }` names a BOOL column of the section source.

- While any row of the latest time slot inside the read period (after source filters) is `false` or NULL, the section shows `labels.notReady` (default "The latest data is not ready yet") and the note instead of its data; the data query is not issued.
- A readiness column of another type renders the unavailable state.

#### Section Type Support

- A `bars` section accepts `period: "latest"` on the category axis only (a time axis window reads history).
- A `calendar-heatmap` accepts `availability` and `readiness`, counts `minimumBuckets` in days, and does not accept `period: "latest"`.
- `pivot-table`, `donut`, `treemap`, `matrix-heatmap`, and `scatter` sections do not take `period`, `availability`, or `readiness`.

#### Missing Buckets and Time Zones

- Missing buckets throughout the requested range receive null values and appear as gaps.
- Chart points use local midnight for date buckets and local hours for hour buckets in the dashboard time zone.
- If local midnight does not exist, a date bucket uses that date's first existing hour. A nonexistent spring hour is omitted; a repeated fall hour uses its earlier occurrence.
- A query reads at most 121 complete returned buckets to detect the 120-bucket cap. Synthetic null points do not count toward that cap. If more returned buckets exist, the oldest are omitted and `labels.truncated` (default: “Older periods are not shown”) accompanies the shortened displayed range.

### Values

#### Formats

Tiles and series accept these formats. The optional `unit` text follows the formatted value.

| Format | Options |
| --- | --- |
| `number` | — |
| `currency` | — |
| `percent` | `inputScale`: `ratio` or `percent` |
| `duration` | `inputUnit` (required): `seconds`, `minutes`, or `hours`; displays whole minutes with hours where applicable |

#### Transforms

Each tile and measurement series may declare `transform: "negate"` or `transform: "absolute"`. The transform acts on each row's value after source filtering and before its declared reduction; a `latest` binding reads and checks distinct transformed values.

#### Processing Order

filter → transform → reduce → top-N and remainder → fill missing periods → derive (moving average, running aggregates) → rebase → display.

### Section Types

| Type | Shows |
| --- | --- |
| [`stat-tiles`](#stat-tiles) | Tiles with an optional comparison and sparkline |
| [`time-series`](#time-series) | Lines or areas over time buckets |
| [`bars`](#bars) | One bar per time bucket or category |
| [`table`](#table) | The view's rows, unaggregated |
| [`calendar-heatmap`](#calendar-heatmap) | One value per calendar day |
| [`matrix-heatmap`](#matrix-heatmap) | One value across two axes |
| [`pivot-table`](#pivot-table) | One value cross-tabulated by rows and columns |
| [`donut` and `treemap`](#donut-and-treemap) | How a total splits over the selected period |
| [`scatter`](#scatter) | One point per row, unaggregated |

#### Stat Tiles

- **Comparison.** A tile with `comparison.direction` (`higher-is-better`, `lower-is-better`, or `neutral`) displays a change from its own source's previous period.
- **Sparkline.** A stat tile may add `sparkline { window }` (2–120): its trailing `window` buckets of the dashboard grain ending at the selected period, days for a `latest` section, drawn in the tile with missing buckets as breaks and named by the tile label.

#### Time Series

**Grain and window.** A `time-series` section may set its own `grain`:

| Dashboard grain | Allowed section grains |
| --- | --- |
| `month` | `month`, `day` |
| `week` | `week`, `day` |
| `day` | `day`, `hour` |

- Without a section `grain`, the dashboard grain applies.
- A positive integer `window` counts trailing buckets of the section grain, ending at the selected period's last bucket. It is required at the dashboard grain.
- A finer section without `window` covers the selected period.

**Display.** A section declares a shared `format` and optional `unit`. Its `variant` is `line` by default or `area`; `stacked` defaults to `false`.

**Series.** A section declares exactly one of `series` and `pivot`.

- `series` holds 1–12 elements, each one of:
  - a measurement `{ label, column, reduction?, transform?, interpolation? }`;
  - a band `{ label, low, high, reduction?, interpolation? }`, drawn as a filled range between two columns of the same quantity. A bucket where either bound is null is a gap.
- `interpolation` is `linear` (default) or `step`.
- `pivot { column, value: { column, reduction?, transform? }, topN?, interpolation? }` draws one series per distinct value of `column`, largest first by the summed value over the displayed window; NULL is labelled `labels.nullCategory`.
  - With `topN { count, otherLabel }`, `count` is 1–11, the largest categories are kept, and every other category is folded into a last series labelled `otherLabel`, which requires `sum`.
  - Without `topN`, at most 12 categories are drawn; more categories show `labels.tooManySeries` (default "Too many series to show") with the count and maximum instead of the chart.
  - A category whose text equals `otherLabel` or `labels.nullCategory` makes the section unavailable.

**Reference lines.** `thresholds: [{ value, label? }]` draw horizontal lines and `bands: [{ from, to }]` (`from` ≤ `to`) shaded ranges; both keep the axis wide enough to show them.

**Stacking.** Stacking adds values, so it requires the `area` variant and `sum` for every measurement series. Stacking does not accept band series and requires `sum` on a pivot value. Stacking with derived series is described below.

#### Derived Series

A measurement series and a `pivot` may add derived series. Each is computed from that binding's reduced values after missing buckets are filled, never from another derived series.

**`movingAverage { window, label, minimumPoints? }`** draws a trailing average as a dashed overlay.

- `window` is 2–120 buckets. `minimumPoints` (1–`window`, default `window`) is the number of measured buckets a window needs before it yields a value.
- Buckets without a value stay out of the average. A bucket without a value of its own has no average, so a gap is never bridged and a sparse series draws its average only at measured buckets.
- The query reads `window − 1` buckets before the displayed window so the first displayed bucket already has its average. The displayed range, the 120-bucket cap and `labels.truncated` are unchanged, and top-N ranking, the remainder and running aggregates use displayed buckets only.

**`running { kind: "sum" | "average", label }`** draws the running total or running average from the first displayed bucket as a dashed overlay.

- A bucket without a value stays out of the average's denominator and does not reset the total, and the running value carries forward across it.
- `kind: "sum"` requires the `sum` reduction.

**`normalize { kind: "rebase", base? }`** indexes every point to a base as `value ÷ base × 100`.

- `base` is `"first"` (default, the series' first non-null displayed value; earlier points stay empty) or `{ "date": "YYYY-MM-DD" }` (the series' value in the bucket containing that date, read even when it lies outside the displayed window, so every period divides by the same base).
- A missing or zero base renders the series empty; gaps stay gaps; overlays divide by their source's base.
- When any series rebases, every measurement series of the section rebases with the same base, the section takes no band series, `thresholds` or `bands`, its `format` is `number` and it has no `unit`.
- A fixed base date requires a date grain.

**Stacking.** With `variant: "area"` and `stacked: true`, a binding with `running { kind: "sum" }` draws only its running totals, stacked, and not its raw values. Stacking does not accept `movingAverage`, `running { kind: "average" }` or `normalize`, and either every stacked series declares `running` or none does.

**On a pivot,** the derived labels are templates in which `{category}` is replaced by the category's label (`labels.nullCategory` for NULL, `otherLabel` for the remainder) and must contain `{category}`. The remainder's derived series are computed from its folded values.

#### Bars

A `bars` section draws one bar per `x` entry.

**Time axis.** `x: { "axis": "time", "grain"?, "window"? }` draws one bar per bucket of the section grain.

- The section grain is the dashboard grain, or a finer grain from the time-series table without `hour`.
- `window` (1–120) counts trailing buckets ending at the selected period and is required at the dashboard grain; a finer grain without `window` covers the selected period.
- The axis is spine-filled with gaps for missing buckets, and each bar is labelled by the locale period label of the section grain, under the same 120-bucket cap and `labels.truncated` as time series.

**Category axis.** `x: { "axis": "category", "column", "order", "by"?, "topN"? }` draws the distinct values of a column aggregated over the selected period only.

**Series.** Series come from one of:

- `series`: 1–12 bindings with `label`, `column`, optional `reduction` (default `sum`), and `transform`;
- `pivot { column, value { column, reduction?, transform? }, topN }` (time axis only): one series per category value, largest first.

**Top-N.** `topN { count, otherLabel }` keeps the `count` largest categories by the ranking value: the sum of one binding over the displayed window, `pivot.value`, or the series named by `x.by` (required when several series rank).

- It folds every other category, including NULL, into a last entry labelled `otherLabel`; ties resolve by category value.
- `pivot.topN.count` is 1–11; `x.topN.count` is 1–100. A category axis without `topN` shows every category.

**Order.** `order` is `"value-desc"` or `{ "sortKey": { "column", "type": "text" | "number" } }` (ascending; a `text` key compares by code point; a category whose rows carry different sort keys makes the section unavailable). Top-N selects, `order` arranges, and the remainder stays last.

**Rules.**

- A remainder, `stacked`, and `value-desc` add values up and require `sum` on the bindings they add.
- Category values are shown as their text (`CAST AS STRING`); a NULL category is labelled `labels.nullCategory` (default “None”). A category whose text equals `otherLabel` or that label makes the section unavailable.
- `format` and `unit` apply to every series.

#### Table

A `table` section reads the view's rows within the selected period without aggregation.

**Columns.** Each of `columns` declares `header`, `column`, and `type`:

| `type` | Column | Display |
| --- | --- | --- |
| `text` | — | — |
| `number` | — | accepts `format` (default `number`), `unit`, and `transform` |
| `date` | DATE | medium date formatting |
| `timestamp` | — | medium date and time in the dashboard time zone |

- Optional `alignment` is `start` or `end`; numbers default to `end`, while other columns default to `start`.
- A column type that does not match its view column renders the unavailable state.

**Sort.** Optional `sort { column, direction }` uses `ascending` or `descending` on the displayed, transformed value, with NULL last and remaining columns as tie-breakers. The default order puts the newest source time first.

**Row count.** A table declares exactly one of:

- `limit` (1–100): top-N without a truncation warning;
- `paging { pageSize }` (1–100). `page.<sectionId>` is accepted only for a paged table; a page past the end shows the last page. `labels.previousPage`, `labels.nextPage`, and `labels.pagination` override pagination text.

**Empty state.** `emptyMessage` replaces the generic empty state.

#### Calendar Heatmap

A `calendar-heatmap` section shows one value per calendar day.

- **Value.** `value` binds a `column` with an optional `reduction` (default `sum`) and `transform`, reduced per day in the dashboard time zone; `format` and the optional `unit` format each day's value.
- **Range.** `range` is `trailing` (default), which covers the `window` days (1–366, required) ending on the selected period's last day, or `calendar-year`, which covers 1 January to 31 December of the year containing that last day and does not take `window`.
- **Missing days.** Days without rows render as outlined cells, distinct from zero, and are named by `labels.missingValue` (default “No data”).
- **Scale.** The optional `maximum` fixes the top of the color scale, and `scaleLabels { less, more }` adds a legend.
- **Locale.** Weekday and month names and the first day of the week follow the dashboard `locale`.
- **Dates.** Calendar days are `YYYY-MM-DD` strings and are never shifted by the time zone: a timestamp binding is converted to the dashboard time zone's date before grouping, while DATE and date-and-hour bindings are read as-is.

#### Matrix Heatmap

A `matrix-heatmap` section shows one value across two axes.

**Axes.** `rows` and `columns` each name an axis; the two axes must differ.

| Axis | Entries |
| --- | --- |
| `{ "axis": "date" }` | One entry per calendar day |
| `{ "axis": "hour" }` | The 24 wall-clock hours `00`–`23`; requires the date-and-hour binding |
| `{ "axis": "category", "column" }` | The distinct values of a column, ascending in the column's own type, with NULL last as `labels.nullCategory` |

- **Value.** `value` binds a `column` with an optional `reduction` (`sum` by default, `average`, `minimum`, or `maximum`; `latest` is rejected) and `transform`, reduced per cell; `format` and the optional `unit` format each cell.
- **Range.** The section reads the selected period or, with a date axis, the trailing `window` days (1–365) ending on the selected period's last day.
- **Empty cells.** Date and hour axes show every entry of that range even without rows; a category axis shows only the values the data holds. Cells without rows render as outlined cells named by `labels.missingValue`, distinct from zero.
- **Scale.** `minimum` (default 0) and `maximum` fix the color scale, and `scaleLabels { less, more }` adds a legend.
- **Cell budget.** A grid of more than 2,000 cells (rows × columns, decided before any query for date and hour axes and from the distinct values of a category axis) shows `labels.cellBudgetExceeded` (default “Too many cells to show. Narrow the section with a filter, a shorter window, or top-N.”) instead of a grid; narrow the period, `window`, or `filters`.
- The section takes `controls`.

#### Pivot Table

A `pivot-table` section cross-tabulates one `value` binding (`column`, optional `reduction` default `sum`, optional `transform`).

**Rows.** `rows { column, label, order?, topN? }` puts one row per distinct value of a column, shown as its text (`CAST AS STRING`), under a row-header column headed `label`.

- `order` is `total-desc` (default; ties by row value), `as-provided` (row values ascending, NULL last), or `{ "sortKey": { "column", "type": "text" | "number" } }` as for `bars`.
- `topN { count, otherLabel }` (1–100) keeps the rows with the largest total over the displayed columns and folds every other row into a last row labelled `otherLabel`.

**Columns.** `columns` is one of:

- `{ "axis": "time", "grain"?, "window"? }`: one column per bucket of the section grain, headed by the locale period label. The section grain is the dashboard grain, or a finer grain from the time-series table without `hour`. `window` (1–120) counts trailing buckets ending at the selected period and is required at the dashboard grain, while a finer grain without `window` covers the selected period. The columns are spine-filled so a bucket without rows still appears.
- `{ "axis": "category", "column" }`: one column per distinct value of a second column over the selected period only, ascending with NULL last.

**Totals.** `totals { column?, row? }` (at least one) adds a totals column headed `column`, a totals row labelled `row`, and, with both, a grand total. Totals, `total-desc`, and `topN` add values up and require `sum`.

**Cells.**

- A cell without rows shows `—`, distinct from a zero.
- A NULL row or column value is labelled `labels.nullCategory`, and a value whose text equals another label makes the section unavailable.
- `format` and `unit` apply to every cell.

**Cell budget.** The displayed grid (rows after top-N × data columns, totals excluded) is bounded at 2,000 cells and the aggregated cells read at 10,000; above either bound `labels.cellBudgetExceeded` (default “Too many cells to show. Narrow the section with a filter, a shorter window, or top-N.”) replaces the table.

**Scrolling.** The first column stays in view while the table scrolls sideways.

#### Donut and Treemap

`donut` and `treemap` sections show how a total splits over the selected period (filter → transform → sum → top-N → order).

**Bindings.** Both bind a `category` column with a `categoryLabel` and one `value { label, column, reduction?, transform? }` whose reduction must be `sum`, because parts are added up to make the whole. `format` and the optional `unit` format every part.

**Values that cannot be parts.**

- A category whose summed value is below zero cannot be a part of a whole: the section shows `labels.negativeComposition` (default “Negative values cannot be shown as parts of a whole”) instead of its chart. Values are never made absolute or dropped silently; add a source filter or `transform: "absolute"` when that is the intent.
- No rows, or only zero values, render the empty state.
- A category whose sum is NULL has no amount: with `topN` it folds into the remainder, otherwise it is not drawn.
- A NULL category is labelled `labels.nullCategory`, and a category whose text equals `otherLabel` or that label makes the section unavailable, as for `bars`.

**Donut.** A `donut` draws one slice per category in `order` (`"value-desc"` or `{ "sortKey": … }`, as for `bars`).

- `topN { count (1–100), otherLabel }` keeps the largest categories by value and folds the rest into a last slice.
- Its centre shows the sum of the drawn slices or, with `centerColumn`, the latest non-NULL value of that column in the period (`—` when there is none; several distinct values at the latest time make the section unavailable). `centerLabel` captions it.
- A visually hidden table lists each slice under `categoryLabel`, the value `label`, and `labels.share` (default “Share”).

**Treemap.** A `treemap` draws one tile per category with area proportional to its value.

- An optional `group` column, declared together with `groupLabel`, tiles categories inside their group, and `topN` applies within each group.
- Groups are ordered by their totals and tiles by value, the remainder last.
- Its table is headed by `groupLabel`, `categoryLabel`, the value `label`, and `labels.share`.

Compositions accept `controls`.

#### Scatter

A `scatter` section draws one point per row of the view within the selected period, unaggregated.

**Axes.** `x` and `y` each bind a `column` with a `label`, a `format`, and an optional `unit`, formatted on the axes, in the tooltip, and in the table alike. Axes take no `transform`: a trend line is drawn from coefficients the warehouse computed on the stored columns, so the app never changes a sign or a scale under the points. Fix the sign in the view.

**Series.** An optional `series { column, label }` colors the points by the text of a third column (`CAST AS STRING`), listed in text order with NULL last as `labels.nullCategory` (a value whose text equals that label makes the section unavailable).

**Points.**

- `limit` (1–1000, required) bounds the points: the newest `limit` rows by source time are drawn (ties resolve by `x`, `y`, and series). When more rows match, `labels.pointsTruncated` (default “Older points are not shown”) appears above the chart.
- A row whose `x` or `y` is NULL is not a point: it is excluded in the query, does not count toward `limit`, and is not listed.
- No points render the empty state.

**Trend line.** The optional `trendLine { slope, intercept }` names two coefficient columns of the same view.

- The line is drawn from the latest row in the period where both are non-NULL (several distinct values at that time make the section unavailable).
- The app never fits it, and the coefficient columns are never plotted; naming the `x`, `y`, or `series` column as a coefficient is rejected at load.
- Under the chart, `labels.trendLine` (default “Trend line”) introduces the line's equation in the axis labels, with both coefficients to four significant digits.

**Table.** A visually hidden table lists every drawn point under the series `label` (when declared), the `x` label, and the `y` label, grouped by series.

A `scatter` accepts `controls`.

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
