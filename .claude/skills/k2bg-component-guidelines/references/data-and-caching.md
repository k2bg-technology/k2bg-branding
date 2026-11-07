# Data and Caching

## Cache Components

Cache Components is the standard for compatible deployments. Enable both `cacheComponents: true` and `partialPrefetching: true` explicitly in the app's Next.js configuration. Cache Components requires the Node.js runtime; its deployment support is verified before enabling it. Apps with Cache Components disabled retain classic segment configuration and their app-specific cache rules in `AGENTS.md`.

Within a Cache Components app:

- Cache selected reads with `'use cache'` and an explicit `cacheLife` profile; attach `cacheTag` for reads invalidated by mutations. Cache reusable data rather than an entire request-dependent page.
- Read `cookies()`, `headers()`, and `searchParams` outside cached scopes, including helpers called by those scopes. Pass only the needed values as cache arguments; those arguments participate in the cache key.
- Resolve request-time and uncached work in components beneath `<Suspense>` so the static shell renders immediately. Await request-time work inside the component under Suspense; a parent that awaits before rendering the boundary blocks its fallback.
- Use `'use cache'` rather than `unstable_cache` for new cache scopes. Do not use segment exports `revalidate`, `dynamic`, or `fetchCache`; Cache Components replaces them with explicit cached and dynamic boundaries.
- Preserve cache semantics deliberately: the default runtime cache is in memory and keyed by deployment. It is not a promise of persistent storage across server instances or deploys.

Application data-access boundaries remain in force. For example, warehouse reads go through the app-owned query client under the app-specific rules in `AGENTS.md`; this skill does not move SDK reads into page components. Deployment-specific configuration belongs in each app's Next.js configuration.

## Mutations and Invalidation

After a successful mutation in a Server Action, use `updateTag(tag)` for immediate expiration and read-your-own-writes. Outside Server Actions, use `revalidateTag(tag, 'max')` for stale-while-revalidate behavior. Do not use the deprecated single-argument `revalidateTag(tag)` form. Assign tags to the cached reads before invalidating them; invalidate after persistence succeeds.

Authenticate and authorize inside every Server Action, regardless of which page renders its form. Validate `FormData` on the server with Zod. Return expected validation/application failures as typed state consumed by `useActionState`; unexpected action exceptions propagate to an error boundary. Keep app-layer error translation with `.claude/rules/error-handling-guidelines.md`.

Use `<form action={serverAction}>` for progressive enhancement: the server submission path works without JavaScript. Client-side pending/error presentation augments that path rather than being required for validation or authorization.

## Official API Sources

Read the matching bundled reference under `node_modules/next/dist/docs/01-app/`:

- `03-api-reference/05-config/01-next-config-js/cacheComponents.md` and `partialPrefetching.md`
- `02-guides/migrating-to-cache-components.md`
- `03-api-reference/01-directives/use-cache.md`
- `03-api-reference/04-functions/cacheLife.md`, `cacheTag.md`, `updateTag.md`, `revalidateTag.md`, and `unstable_cache.md`
- `02-guides/forms.md` and `01-getting-started/10-error-handling.md`

Dependency versions come from each app's `package.json`.
