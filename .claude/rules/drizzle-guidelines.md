---
paths: apps/blog/**/drizzle/**/*.ts
---

# Drizzle Persistence Layer Guidelines

Conventions for the blog app's persistence layer: the single-file schema, the client
singleton, and the Drizzle adapters under `modules/<module>/adapters/output/`.

> **Scope note:** these are target conventions for new and changed code. Existing
> violations are tracked in dedicated issues — do NOT refactor them as part of
> unrelated changes.

## Schema (`apps/blog/infrastructure/drizzle/schema.ts`)

- Single authored schema file. The separate snapshot under
  `apps/blog/infrastructure/drizzle/migrations/` is drizzle-kit output — never edit it
  by hand.
- Naming mirrors the pre-existing production database and is intentionally diff-stable
  (#255). Keep it: PascalCase table string literals (`pgTable('Post', ...)`) with
  camelCase plural TS exports (`posts`), and explicit named FK constraints.
- Column casing is mixed for historical reasons. New columns MUST follow the casing of
  the surrounding table (app tables mostly camelCase; auth tables owned by better-auth
  are snake_case) — do not "normalize" existing names.
- Declare relations with `relations()` next to the tables involved.
- `apps/blog/drizzle.config.ts` is `strict` + `verbose` with a `tablesFilter`
  allow-list. Adding a table requires adding it to the filter; do not loosen the config.

## Client (`apps/blog/infrastructure/drizzle/client.ts`)

- App code uses the `getDrizzleClient()` singleton; `createDrizzleClient()` /
  `resetDrizzleClient()` are for tests only.
- Repositories and query services receive `DrizzleClient` via constructor injection —
  never create ad-hoc connections or import the client deep inside a function.
- The postgres-js options are Lambda-safe (`max: 1`, module-scoped reuse). Do not raise
  the pool size or move the client out of module scope.

## Repositories vs. Query Services (CQRS split)

- **Repositories** (`modules/<module>/adapters/output/repositories/drizzle/`) serve
  commands and return domain entities. Canonical:
  `apps/blog/modules/post/adapters/output/repositories/drizzle/postRepository.ts` —
  rows go through the co-located `mapper.ts` (`toDomain` / `toPersistence`), misses
  return `null`, writes use `insert().onConflictDoUpdate()` upserts, and every method
  wraps failures in `RepositoryError`.
- **Query services** (`modules/<module>/adapters/output/query-services/drizzle/`) serve
  reads and return plain DTOs. Canonical:
  `apps/blog/modules/post/adapters/output/query-services/drizzle/fetchPostSummariesByCategoryQueryService.ts`
  — `select()` projections with `leftJoin`, plus a parallel `count()` query for
  pagination (no N+1).
- Never cross the split: a query service MUST NOT return domain entities or raw rows;
  a repository MUST NOT return DTOs.

## Transactions

- Any operation writing multiple rows or tables MUST run inside `db.transaction`.
  Canonical:
  `apps/blog/modules/post/adapters/output/repositories/drizzle/postBatchRepository.ts`.

## Mapping — MUST NOT

- No silent enum fallbacks: a `switch` mapping a DB string to a domain enum MUST throw
  `MappingError` in its `default:` branch, never coerce unknown values to a default
  member.
- No unchecked casts from row values to domain types (e.g. `row.category as Category`)
  — narrow through an explicit mapping function that validates the value.
- No presentation concerns in persistence: URL/path composition (e.g.
  `` `${uuid}/${slug}` ``) belongs to the domain or presentation layer, not a mapper or
  query service.
- Represent absent values consistently: one canonical representation per field (the
  entity's value-object empty state, or `null` in DTOs) — never a mix of `''` / `null`
  per call site.

## Verification

- Schema change: edit `schema.ts` → `pnpm -F blog db:generate` → review the generated
  SQL → `pnpm -F blog db:migrate` → `pnpm -F blog db:verify` (ephemeral-container
  round-trip; must end with an empty diff) before pushing.
- Adapter-only change: `pnpm -F blog typecheck && pnpm -F blog lint && pnpm -F blog test`.
- Never run `db:up` / docker compose from a git worktree, and never run destructive
  migration commands against production (see `AGENTS.md`, Database section).
