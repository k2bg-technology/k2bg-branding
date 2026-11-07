# Pages and Routing

## Generated Route Props

Use global `PageProps<'/route'>` and `LayoutProps<'/route'>` for page/layout entry points. Do not handwrite `params` types or shadow those global helpers with app-local aliases. Await `params` and page `searchParams`; their values are Promises. Query values remain `string | string[] | undefined`; derive domain-specific input with Zod instead of asserting a narrower type.

For example, an item detail page uses `PageProps<'/items/[itemId]'>`, and a workspace layout uses `LayoutProps<'/workspaces/[workspaceId]'>`. The route string describes the filesystem route, including dynamic segment names.

Route-aware typechecking runs `next typegen && tsc --noEmit` in the app. Next.js generates these globals during `next typegen`, `next dev`, or `next build`; no import is needed. `next typegen` loads `next.config` in the production phase, so environment variables the config requires are set wherever typechecking runs.

Layouts do not depend on query parameters. Use a page's `searchParams` or a small Client Component using `useSearchParams` for query-dependent UI; shared layouts persist across navigations.

## Route File Responsibilities

- `page` and `layout` default to Server Components and compose components from the app's components directory. They define no other components; framework exports such as `generateMetadata` stay in the route file.
- `loading` supplies the segment's Suspense fallback. It does not cover request-time work in the parent layout; place a Suspense boundary around that work. For example, a result-list segment's loading component composes an app skeleton.
- `error` and `global-error` are Client Components. Use the documented `retry()` prop to re-fetch and re-render the failed segment; `reset()` only clears the error state without re-fetching. `global-error` replaces the root layout and supplies its own `html` and `body`.
- `not-found` renders missing-resource UI. Use `notFound()` when a resource is absent; data failures follow the app-specific policy in `.claude/rules/error-handling-guidelines.md` and `AGENTS.md`, "Observatory App".

Expected Server Action failures are returned as state for `useActionState`; uncaught rendering errors reach `error.tsx`. Page-level fetch handling and metadata error handling stay with `.claude/rules/error-handling-guidelines.md`; do not replace those rules with a blanket throw or 404 policy.

## Metadata

Use `generateMetadata` for data-dependent metadata. Share a module-level React `cache` wrapper for a non-fetch loader used by both metadata and the page; matching `fetch` requests already receive request memoization. React `cache` deduplicates work within a render request, distinct from cross-request `'use cache'` storage. For example, an item detail page and its metadata generator share a cached item loader, while a localized layout generates language-specific metadata.

## Official API Sources

Read these bundled files for the relevant API details under `node_modules/next/dist/docs/01-app/`:

- `03-api-reference/03-file-conventions/page.md`, `layout.md`, `loading.md`, `error.md`, and `not-found.md`
- `03-api-reference/06-cli/next.md` (`next typegen`)
- `03-api-reference/04-functions/generate-metadata.md`
- `01-getting-started/10-error-handling.md`
