---
paths: apps/blog/modules/**/*.ts, apps/blog/app/**/*.tsx, apps/blog/server/middleware/*.ts, apps/observatory/modules/**/*.ts, apps/observatory/app/**/*.tsx, apps/observatory/components/**/*.tsx
---

# Error Handling Guidelines (Blog and Observatory Apps)

Errors are layered and translated at each boundary — never leaked raw across layers:

```
DomainError (domain invariants)
  → RepositoryError / ExternalSourceError / MappingError (adapters wrap infrastructure)
    → UseCaseError / SyncError (use cases wrap orchestration failures)
      → HTTPException (Hono API) | UseCaseError-discriminated notFound() (pages)
```

> **Scope note:** these are target conventions for new and changed code. Existing
> violations are tracked in dedicated issues — do NOT refactor them as part of
> unrelated changes.

## Domain Errors (`modules/<module>/domain/errors/errors.ts`)

Canonical: `apps/blog/modules/post/domain/errors/errors.ts`.

- Each module defines a `DomainError extends Error` base; concrete errors extend it —
  never extend `Error` directly.
- The base MUST set `this.name = this.constructor.name` and call
  `Object.setPrototypeOf(this, new.target.prototype)` so `instanceof` and error names
  survive transpilation. Do not hardcode name strings per subclass.
- Domain errors express business rule violations only (invalid value object, invariant
  breach, illegal state transition). Infrastructure failures are NOT domain errors.

## Adapter Errors (`modules/<module>/adapters/shared/errors.ts`)

Canonical: `apps/blog/modules/post/adapters/shared/errors.ts` (`RepositoryError`,
`ExternalSourceError`, `MappingError`).

- Adapters MUST wrap every raw driver / fetch / SDK failure in one of these types and
  preserve the original error as `cause` — never re-throw a raw infrastructure error.
- Adapters MUST NOT throw domain-typed errors for infrastructure failures (e.g. an
  email SDK failure is an adapter error, not a `DomainError` subclass).
- External integrations (Notion, Instagram, Cloudinary, SES) wrap in
  `ExternalSourceError` (or a dedicated `RepositoryError` subclass) and may log before
  throwing; mapping failures throw `MappingError`.

## Use-Case Errors (`modules/<module>/use-cases/shared/errors.ts`)

Canonical: `apps/blog/modules/post/use-cases/shared/errors.ts` (`UseCaseError`,
`PostNotFoundError`, `SyncError`).

- Use cases translate lower-layer failures into `UseCaseError` subclasses when they
  carry application meaning (not found, invalid pagination); otherwise let the error
  propagate.
- MUST NOT swallow errors: no empty `catch {}` and no catch-and-return that discards
  the cause without logging. If a per-item failure is tolerated in a batch, log the
  error before recording the failure.

## API Boundary (`apps/blog/server/middleware/errorHandler.ts`)

- `errorHandler` maps `HTTPException` to its status; every other error becomes
  `500 INTERNAL_SERVER_ERROR`. To return an intentional status from a route handler,
  throw `HTTPException`. Details: `.claude/rules/hono-api-guidelines.md`.

## Next.js Page Boundary (`apps/blog/app/`)

Canonical: `apps/blog/app/search/page.tsx` and
`apps/blog/app/category/[category]/page.tsx`.

- When a page-level fetch fails, discriminate before reacting: `UseCaseError` →
  `logger.warn` (expected application failure); anything else → `logger.error`
  (unexpected/infrastructure failure). Only then fall back (`notFound()`).
- MUST NOT use a blanket `.catch(() => notFound())` — it masks outages and mapping
  bugs as 404s and hides the cause from logs.
- `generateMetadata` MUST handle errors symmetrically with its page component: the
  same call gets the same discrimination, not a different (or missing) catch.
- Rendering errors are caught by the global boundaries (`apps/blog/app/error.tsx`,
  `apps/blog/app/not-found.tsx`) — do not add per-page try/catch around rendering.
- Observatory dashboards degrade instead of 404ing: the async section component
  awaits the fetch, logs with `logger.error`, and renders an inline unavailable
  state (canonical: `apps/observatory/components/table-catalog/TableCatalog.tsx`).
  MUST NOT `notFound()` on a data failure.

## Verification

- `pnpm -F blog typecheck && pnpm -F blog lint && pnpm -F blog test` (or `-F observatory`).
- Error mapping and discrimination are behavior — cover them in co-located
  `*.test.ts(x)` per `.claude/rules/unit-test-guidelines.md` (e.g. assert an adapter
  wraps a failing driver call in `RepositoryError` with `cause` preserved).
