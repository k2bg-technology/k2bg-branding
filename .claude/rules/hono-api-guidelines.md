---
paths: apps/blog/server/**/*.ts
---

# Hono API Server Guidelines

Conventions for the Hono REST API integrated into the blog app. The server lives in
`apps/blog/server/` and is wired into Next.js via `apps/blog/app/api/[[...route]]/route.ts`
(`handle(app)` from `hono/vercel`, one export per HTTP method).

## App Setup (`apps/blog/server/app.ts`)

- The app is an `OpenAPIHono` (from `@hono/zod-openapi`) with `.basePath('/api')`.
- Middleware order matters and is fixed:
  1. `app.use('*', requestLogger)` — global logging.
  2. `app.use('/<path>', apiKeyAuth)` — per-path auth for every protected route
     (`/posts`, `/images`, `/revalidate`). New protected routes MUST be added here.
  3. `app.route('/', <routes>)` — mount route groups.
  4. `app.onError(errorHandler)` — registered last.
- OpenAPI docs (`/api/doc.json`) and Swagger UI (`/api/doc`) are exposed only when
  `NODE_ENV !== 'production'`. Keep that gate.
- The `ApiKeyAuth` security scheme (`x-api-key` header) is registered once via
  `app.openAPIRegistry.registerComponent(...)`.

## Routes (`apps/blog/server/routes/`)

Canonical example: `apps/blog/server/routes/post.ts`.

- One file per resource; each file creates its own `new OpenAPIHono()` and is re-exported
  from `apps/blog/server/routes/index.ts`.
- Define routes with `createRoute()` including OpenAPI metadata: `method`, `path`,
  `summary`, `security: [{ ApiKeyAuth: [] }]` (for protected routes), `request`
  (when there is a body), and `responses` with a schema and description per status code.
- Attach handlers with `<routes>.openapi(route, handler)`.
- Handlers construct use cases via DI factory functions from
  `apps/blog/infrastructure/di` (e.g. `createSyncPostsFromExternalUseCase()`)
  and call `.execute()` — never instantiate adapters or repositories inline.
- Read validated request bodies with `c.req.valid('json')`; validation comes from the
  Zod schema declared in `request`.

## Schemas (`apps/blog/server/schemas/`)

- Import `z` from `@hono/zod-openapi` (not plain `zod`).
- Naming: exported top-level schemas end in `ResponseSchema` / `RequestSchema`
  (e.g. `SyncPostsResponseSchema`); internal building blocks are unexported
  `PascalCase + Schema`.
- Register exported schemas as OpenAPI components with `.openapi('<ComponentName>')`.
- Reuse `ErrorResponseSchema` from `apps/blog/server/schemas/shared.ts` for every error
  response — do not invent new error shapes.

## Middleware & Errors (`apps/blog/server/middleware/`)

- `apiKeyAuth` — compares the `x-api-key` header to `process.env.API_KEY`; throws
  `HTTPException(401)` on mismatch.
- `requestLogger` — logs request start/completion with method, path, status, duration.
- `errorHandler` — maps `HTTPException` to its status; everything else (including domain
  and repository errors) becomes `500 INTERNAL_SERVER_ERROR`. Response shape:
  `{ "error": { "code", "message", "status", "timestamp" } }`.
- To return a specific HTTP status from a handler, throw `HTTPException` — domain errors
  are NOT mapped to statuses automatically.

## Testing

- Every route and middleware file has a co-located `*.test.ts` (Vitest).
- Route tests mount the route group on a plain `new Hono()` and drive it with
  `app.request('/posts', { method: 'PATCH' })`; DI factories are stubbed with
  `vi.mock('../../infrastructure/di', ...)`.
- Assert on `res.status` and `await res.json()`. Follow
  `.claude/rules/unit-test-guidelines.md`.

## Security

- Every state-changing route MUST be behind `apiKeyAuth` (wired in `app.ts`).
- Never log request bodies or PII in `requestLogger` or handlers.
